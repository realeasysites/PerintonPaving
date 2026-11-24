// Lead scoring for Perinton Paving.
// Rule from the owner: small jobs are welcome close to Fairport. Farther out,
// a job has to be big enough to be worth the drive.
// Tweak the settings below; everything else follows from them.

// Towns that count as "close to Fairport" (any job size welcome).
const NEAR_TOWNS = [
  'Fairport', 'Perinton', 'Pittsford', 'Penfield', 'East Rochester',
  'Victor', 'Macedon', 'Brighton'
];

// A budget at or above this (in dollars) makes a job "big".
const BIG_BUDGET_MIN = 10000;

// Budget options as they appear on the form → the low end of the range.
const BUDGET_FLOOR = {
  'Under $5k': 0,
  '$5k–$10k': 5000,
  '$10k–$20k': 10000,
  '$20k–$50k': 20000,
  '$50k+': 50000
};

const BIG_CLIENT_TYPES = ['Builder or contractor', 'Commercial property', 'Town, HOA or club'];
const BIG_SERVICES = ['New construction driveway', 'Commercial blacktop', 'Pickleball court'];
const BIG_SIZES = ['250+ ft (estate / long drive)', 'Parking lot or court'];
const SMALL_SIZES = ['Under 50 ft'];

function scoreLead(q) {
  const reasons = [];
  const flags = [];

  const zone = NEAR_TOWNS.includes(q.town) ? 'near' : (q.town ? 'far' : 'unknown');

  let big = false;
  if (BIG_CLIENT_TYPES.includes(q.client_type)) { big = true; reasons.push(q.client_type); }
  if (BIG_SERVICES.includes(q.service)) { big = true; reasons.push(q.service); }
  if (BIG_SIZES.includes(q.size)) { big = true; reasons.push(q.size); }
  const floor = BUDGET_FLOOR[q.budget];
  if (floor !== undefined && floor >= BIG_BUDGET_MIN) { big = true; reasons.push('Budget ' + q.budget); }

  if (q.grade === 'Steep hill') flags.push('Steep');
  if (q.access === 'Highway or main-road frontage') flags.push('Highway');
  if (q.access === 'Busy road') flags.push('Busy road');
  if (q.access === 'Tight access (narrow, wires, trees)') flags.push('Tight access');
  if (SMALL_SIZES.includes(q.size)) flags.push('Small');
  if (q.budget === 'Under $5k') flags.push('Under $5k');

  let tier;
  if (big) {
    tier = 'priority';
  } else if (zone === 'near') {
    // Close to home: welcome, unless it's small AND a hard job (steep / highway / tight).
    const hard = flags.some(f => ['Steep', 'Highway', 'Tight access'].includes(f));
    if (hard && SMALL_SIZES.includes(q.size)) {
      tier = 'low';
      reasons.push('Close to Fairport, but a small job with tough access');
    } else {
      tier = 'standard';
      reasons.push('Close to Fairport');
    }
  } else {
    tier = 'low';
    reasons.push(zone === 'far' ? 'Small job, outside the Fairport area' : 'Small job, town not given');
  }

  return { tier, zone, reasons, flags };
}

module.exports = { scoreLead, NEAR_TOWNS, BIG_BUDGET_MIN };
