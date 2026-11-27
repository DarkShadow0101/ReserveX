const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { validateEnv } = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/user.model');
const Organization = require('../models/organization.model');
const Membership = require('../models/membership.model');
const Event = require('../models/event.model');
const TicketType = require('../models/ticketType.model');

function addDaysAtHour(daysFromNow, hour) {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysFromNow);
  dt.setHours(hour, 0, 0, 0);
  return dt;
}

const DEMO_CATALOG = [
  {
    title: 'Arijit Singh Symphony Live',
    venue: 'Jio World Convention Centre, Mumbai',
    description:
      'Full orchestral arena concert featuring live acoustic medleys, symphony brass, and synced stage pyrotechnics.',
    startOffsetDays: 1,
    startHour: 19,
    durationHours: 3,
    tiers: [
      { name: 'Silver Stand', description: 'Elevated arena seating with stage sightlines', price: 199900, totalCapacity: 400 },
      { name: 'Fan Pit Access', description: 'Standing pitch pass directly facing main stage', price: 449900, totalCapacity: 150 }
    ]
  },
  {
    title: 'Sunburn Arena Underground',
    venue: 'Vagator Hilltop, Goa',
    description:
      'Open-air sunset electronic music festival with multi-stage laser production and coastal sundowner sets.',
    startOffsetDays: 2,
    startHour: 17,
    durationHours: 6,
    tiers: [
      { name: 'Festival GA Pass', description: 'Single-day festival grounds & mainstage access', price: 149900, totalCapacity: 500 },
      { name: 'VIP Elevated Deck', description: 'Dedicated bar lane and panoramic soundstage lounge', price: 399900, totalCapacity: 120 }
    ]
  },
  {
    title: 'Midnight Comedy Collective',
    venue: 'Canvas Laugh Club, Bengaluru',
    description:
      'Late-night stand-up comedy showcase bringing headliners and surprise crowd-work sets to Indiranagar.',
    startOffsetDays: 5,
    startHour: 20,
    durationHours: 2,
    tiers: [
      { name: 'Club Seating', description: 'Standard table seating with waiter service', price: 69900, totalCapacity: 180 },
      { name: 'Front Row Lounge', description: 'Reserved cabaret row near stage microphone', price: 119900, totalCapacity: 40 }
    ]
  },
  {
    title: 'Pro Kicks: Mumbai vs Bengaluru Derby',
    venue: 'Mumbai Football Arena, Mumbai',
    description:
      'Under-the-lights football stadium derby fixture with supporters blocks, fan plaza, and halftime entertainment.',
    startOffsetDays: 9,
    startHour: 19,
    durationHours: 2,
    tiers: [
      { name: 'West Stand', description: 'Covered bucket seat in supporters bowl', price: 49900, totalCapacity: 800 },
      { name: 'Hospitality Club Box', description: 'Pitchside box seating with lounge refreshments', price: 179900, totalCapacity: 90 }
    ]
  },
  {
    title: 'Frontend & AI Systems Summit Workshop',
    venue: 'HICC Novotel, Hyderabad',
    description:
      'Hands-on developer summit covering real-time web architecture, engineering demos, and interactive design labs.',
    startOffsetDays: 14,
    startHour: 10,
    durationHours: 7,
    tiers: [
      { name: 'Conference Pass', description: 'All main-hall talks, expo floor, and lunch', price: 129900, totalCapacity: 260 },
      { name: 'Workshop + Code Lab', description: 'Guided small-group architecture workshop access', price: 249900, totalCapacity: 80 }
    ]
  },
  {
    title: 'Monsoon Stage Theatre & Art Exhibition',
    venue: 'Kamani Auditorium, Delhi',
    description:
      'Evening contemporary play premiere paired with a curated gallery walkthrough of independent Indian visual artists.',
    startOffsetDays: 20,
    startHour: 18,
    durationHours: 3,
    tiers: [
      { name: 'Gallery + Balcony', description: 'Auditorium balcony seat plus exhibition entry', price: 59900, totalCapacity: 220 },
      { name: 'Orchestra Dress Circle', description: 'Center-stall acoustics and artist meet & greet', price: 109900, totalCapacity: 100 }
    ]
  }
];

/** Idempotently seeds a realistic demo organizer, catalog events, and INR ticket tiers. */
async function seedDemoCatalog() {
  validateEnv();
  await connectDB();

  let organizerUser = await User.findOne({ email: 'demo-organizer@reservex.local' });
  if (!organizerUser) {
    const passwordHash = await bcrypt.hash('DemoOrganizer#2026', 10);
    organizerUser = await User.create({
      fullName: 'ReserveX Live Curator',
      email: 'demo-organizer@reservex.local',
      password: passwordHash,
      role: 'owner'
    });
  }

  let org = await Organization.findOne({ slug: 'reservex-live-events' });
  if (!org) {
    org = await Organization.create({
      name: 'ReserveX Live',
      slug: 'reservex-live-events',
      description: 'Verified flagship stages across concerts, festivals, comedy, sports, and arts.',
      createdBy: organizerUser._id,
      ownerCount: 1
    });
  }

  await Membership.findOneAndUpdate(
    { user: organizerUser._id, organization: org._id },
    { $setOnInsert: { user: organizerUser._id, organization: org._id, role: 'owner' } },
    { upsert: true, new: true }
  );

  let createdEvents = 0;
  let syncedTiers = 0;

  for (const item of DEMO_CATALOG) {
    const startsAt = addDaysAtHour(item.startOffsetDays, item.startHour);
    const endsAt = new Date(startsAt.getTime() + item.durationHours * 3600000);

    let event = await Event.findOne({ organization: org._id, title: item.title });
    if (!event) {
      event = await Event.create({
        organization: org._id,
        title: item.title,
        description: item.description,
        venue: item.venue,
        startsAt,
        endsAt,
        status: 'published',
        createdBy: organizerUser._id
      });
      createdEvents += 1;
    }

    for (const tier of item.tiers) {
      const existingTier = await TicketType.findOne({ event: event._id, name: tier.name });
      if (!existingTier) {
        await TicketType.create({
          event: event._id,
          name: tier.name,
          description: tier.description,
          price: tier.price,
          currency: 'INR',
          totalCapacity: tier.totalCapacity,
          salesStartsAt: new Date(Date.now() - 86400000),
          salesEndsAt: startsAt,
          isActive: true
        });
        syncedTiers += 1;
      }
    }
  }

  console.log(
    `[seed] ReserveX demo catalog ready (org="${org.name}", createdEvents=${createdEvents}, createdTiers=${syncedTiers})`
  );
}

seedDemoCatalog()
  .catch((err) => {
    console.error('[seed] Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
