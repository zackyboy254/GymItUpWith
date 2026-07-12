import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    }

    const cleanedMsg = message.toLowerCase();
    let reply = "That's a great question! Consistent effort is key. Could you tell me more about your current fitness level and what you want to achieve (e.g. weight loss, muscle building, overall fitness)?";

    // Custom response routing based on keyword mapping
    if (cleanedMsg.includes('weight') || cleanedMsg.includes('lose') || cleanedMsg.includes('fat') || cleanedMsg.includes('slimming')) {
      reply = "For weight loss, we focus on a combination of calorie-burning high-intensity interval training (HIIT), strength training to boost metabolism, and personalized nutrition plans. Let's chat via the Contact page or WhatsApp to draft a custom weight loss strategy!";
    } else if (cleanedMsg.includes('muscle') || cleanedMsg.includes('gain') || cleanedMsg.includes('bulk') || cleanedMsg.includes('strength')) {
      reply = "Gaining clean muscle requires progressive overload training and high-quality protein nutrition. We offer tailored hypertrophy programs, weight tracking, and form feedback. Let's get you lifting heavy and eating clean!";
    } else if (cleanedMsg.includes('price') || cleanedMsg.includes('cost') || cleanedMsg.includes('pay') || cleanedMsg.includes('fee') || cleanedMsg.includes('pricing')) {
      reply = "Our coaching pricing is competitive and flexible depending on whether you want Online Coaching, Personal Training (1-on-1), or to attend our Group Bootcamps. Send us a message on the Contact page, and I will share our latest packages!";
    } else if (cleanedMsg.includes('bootcamp') || cleanedMsg.includes('event') || cleanedMsg.includes('camp') || cleanedMsg.includes('challenge')) {
      reply = "We run intense outdoor bootcamps and fitness challenges in Nairobi! Check out our 'Events' page to view our upcoming camp, or register directly using the provided registration links.";
    } else if (cleanedMsg.includes('where') || cleanedMsg.includes('location') || cleanedMsg.includes('gym') || cleanedMsg.includes('locate') || cleanedMsg.includes('nairobi')) {
      reply = "Our main training facility is located in Nairobi, Kenya. We offer on-site gym sessions and also handle online coaching globally! Visit our 'Contact' page to check out the Google Maps location details.";
    } else if (cleanedMsg.includes('who') || cleanedMsg.includes('coach') || cleanedMsg.includes('instructor') || cleanedMsg.includes('trainer')) {
      reply = "Coach is a certified fitness specialist in Kenya with years of experience leading body transformations, bootcamps, and nutrition consulting. Check out our 'Achievements' page to view his official certifications!";
    } else if (cleanedMsg.includes('hello') || cleanedMsg.includes('hi') || cleanedMsg.includes('habari') || cleanedMsg.includes('hey')) {
      reply = "Habari! Warm welcome to Gym It Up With! What fitness goals are we tackling today? Let me know if you are interested in muscle gain, weight loss, or joining our next bootcamp!";
    } else if (cleanedMsg.includes('whatsapp') || cleanedMsg.includes('contact') || cleanedMsg.includes('call') || cleanedMsg.includes('phone') || cleanedMsg.includes('email')) {
      reply = "You can easily reach Coach directly! Go to our 'Contact' page to initiate a direct WhatsApp chat, call us, or send an email. We reply instantly!";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { reply: "Sorry, I had a momentary muscle cramp! Please ask your question again." },
      { status: 500 }
    );
  }
}
