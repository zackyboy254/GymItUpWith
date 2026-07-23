export const PROGRAM_OPTIONS = [
  '90-Day Transformation Challenge',
  'Weight Loss Program',
  'Push-Up Challenge',
  'Pull-Up Challenge',
  'Core & Abs Challenge',
  'Squat Challenge',
  'Community Runs',
  'Community Walks',
  'Hiking Adventures',
  'Outdoor Meetups',
  'Networking Sessions',
  'Kids Fitness',
] as const;

export type ProgramOption = (typeof PROGRAM_OPTIONS)[number];

export const PROGRAM_SLUGS: Record<string, ProgramOption> = {
  '90-day-challenge': '90-Day Transformation Challenge',
  'weight-loss': 'Weight Loss Program',
  'push-up-challenge': 'Push-Up Challenge',
  'pull-up-challenge': 'Pull-Up Challenge',
  'core-abs-challenge': 'Core & Abs Challenge',
  'squat-challenge': 'Squat Challenge',
  'community-run': 'Community Runs',
  'community-walk': 'Community Walks',
  'hiking': 'Hiking Adventures',
  'meetups': 'Outdoor Meetups',
  'networking': 'Networking Sessions',
  'kids-fitness': 'Kids Fitness',
};

export const PROGRAM_DETAILS: Record<ProgramOption, {
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  eligibility: string;
  schedule: string;
  bring: string[];
  image: string;
}> = {
  '90-Day Transformation Challenge': { eyebrow: 'Signature challenge', title: 'Make 90 days count.', description: 'A coached transformation sprint combining training, nutrition, weekly check-ins, and a community that keeps you accountable.', benefits: ['Personalised training roadmap', 'Weekly progress check-ins', 'Nutrition guidance and habits'], eligibility: 'Open to adults of every fitness level who are ready to commit to consistent action.', schedule: 'New cohort dates announced monthly.', bring: ['Water bottle', 'Comfortable training clothes', 'A willingness to start'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80' },
  'Weight Loss Program': { eyebrow: 'Primary programme', title: 'Lose weight. Keep your life.', description: 'A sustainable, coach-led system for fat loss, better energy, and confidence without extreme rules.', benefits: ['Sustainable nutrition strategy', 'Strength and conditioning sessions', 'Support between sessions'], eligibility: 'Ideal for beginners and returning members who want a realistic, supportive plan.', schedule: 'Rolling 12-week intake. Start dates available on request.', bring: ['Water bottle', 'A food and training journal', 'Your current goals'], image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80' },
  'Push-Up Challenge': { eyebrow: 'Strength challenge', title: 'Build your push.', description: 'A progressive daily practice that builds pressing strength and the habit of showing up.', benefits: ['Progressive rep targets', 'Technique coaching', 'Community leaderboard'], eligibility: 'Suitable for beginners with modified options and experienced members.', schedule: '30-day challenge. New starts every first Monday.', bring: ['Training mat', 'Water bottle', 'Your baseline rep count'], image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1800&q=80' },
  'Pull-Up Challenge': { eyebrow: 'Strength challenge', title: 'Earn your first pull-up.', description: 'Build the back, grip, and confidence needed to move from assisted reps to clean strength.', benefits: ['Accessible progressions', 'Grip and back programming', 'Coach feedback'], eligibility: 'Open to all levels, including members starting from zero unassisted reps.', schedule: 'Six-week coached cycle. Dates announced each quarter.', bring: ['Water bottle', 'Training straps if needed', 'A patient mindset'], image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=1800&q=80' },
  'Core & Abs Challenge': { eyebrow: 'Movement challenge', title: 'Build a stronger centre.', description: 'Short, focused sessions for a stable core, better movement, and everyday confidence.', benefits: ['Efficient 15-minute sessions', 'Mobility and stability work', 'Daily accountability prompts'], eligibility: 'A friendly starting point for every level, with low-impact variations available.', schedule: '21-day cycle. Join any time.', bring: ['Training mat', 'Water bottle', 'A small clear space'], image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1800&q=80' },
  'Squat Challenge': { eyebrow: 'Movement challenge', title: 'Own your foundation.', description: 'Improve lower-body strength, mobility, and consistency through a progressive squat practice.', benefits: ['Technique and mobility coaching', 'Progressive volume', 'Lower-body strength gains'], eligibility: 'Open to adults at every level. Coaches provide movement alternatives as needed.', schedule: '30-day challenge. New starts monthly.', bring: ['Water bottle', 'Comfortable shoes', 'Your baseline squat count'], image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1800&q=80' },
  'Community Runs': { eyebrow: 'Weekend activity', title: 'Run with your people.', description: 'Easy-paced miles, good conversation, and a stronger finish with the Grow Fit community.', benefits: ['Multiple pace groups', 'Beginner-friendly route', 'Post-run connection'], eligibility: 'Everyone is welcome, including first-time runners and walkers.', schedule: 'Saturdays at 7:00 AM. Schedule subject to change.', bring: ['Running shoes', 'Water bottle', 'Light layer'], image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1800&q=80' },
  'Community Walks': { eyebrow: 'Weekend activity', title: 'Move at your pace.', description: 'Low-impact movement, fresh air, and easy conversation for every starting point.', benefits: ['Low-impact exercise', 'Accessible pace', 'New community connections'], eligibility: 'Perfect for beginners, families, and members returning to movement.', schedule: 'Sundays at 8:00 AM.', bring: ['Comfortable walking shoes', 'Water bottle', 'Sun protection'], image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1800&q=80' },
  'Hiking Adventures': { eyebrow: 'Outdoor adventure', title: 'Take your progress outside.', description: 'Trade the treadmill for fresh air, new trails, and shared milestones.', benefits: ['Guided trail experience', 'Endurance and mobility', 'Memories with the community'], eligibility: 'Moderate fitness required. Trail details are shared before each outing.', schedule: 'Monthly. See the Events calendar for the next route.', bring: ['Hiking shoes', 'Water and snacks', 'Weather-appropriate layers'], image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1800&q=80' },
  'Outdoor Meetups': { eyebrow: 'Community connection', title: 'Bring your whole self.', description: 'A relaxed table for introductions, wins, ideas, and the accountability that grows between sessions.', benefits: ['Meet members across industries', 'Share goals and ideas', 'Celebrate community wins'], eligibility: 'Open to members, families, and curious first-time visitors.', schedule: 'First Friday of each month at 6:30 PM.', bring: ['An open mind', 'One current goal', 'A friend if you like'], image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=80' },
  'Networking Sessions': { eyebrow: 'Professional community', title: 'Connections between sets.', description: 'Train with people from different industries and fitness levels while growing your professional network.', benefits: ['Industry-diverse connections', 'Peer accountability', 'Curated community conversations'], eligibility: 'Open to professionals, students, founders, and creatives of every level.', schedule: 'Monthly sessions. RSVP required.', bring: ['A short introduction', 'Your current focus', 'Business cards if useful'], image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=80' },
  'Kids Fitness': { eyebrow: 'Family fitness', title: 'Strong habits start young.', description: 'Playful, structured movement experiences that help families make healthy living part of everyday life.', benefits: ['Fun movement games', 'Family workout sessions', 'Healthy lifestyle education'], eligibility: 'Designed for children with a parent or guardian participating or present.', schedule: 'Weekend sessions. Family dates announced monthly.', bring: ['Comfortable clothes', 'Water bottle', 'A grown-up ready to play'], image: 'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=1800&q=80' },
};
