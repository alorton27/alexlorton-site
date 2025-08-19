// =============================
export default function About() {
return (
<main className="mx-auto max-w-3xl p-6 space-y-10">
<section className="space-y-3">
<h1 className="text-3xl font-semibold">Me</h1>
<p className="text-neutral-700 dark:text-neutral-300">
Hi, I’m Alex. I’m an entrepreneur, runner, dad, New Yorker, Ohioan and more. This is my place to build personal tools and experiments. Drop me a line to connect.
</p>
</section>


<section className="space-y-3">
<h2 className="text-xl font-medium">Work Experience</h2>
<div className="space-y-2 text-neutral-700 dark:text-neutral-300">
<div>
<div className="font-medium">Cofounder & Co-CEO</div>
<div>Cater2.me</div>
<div className="text-sm text-neutral-500">Sep 2010 – Present</div>
</div>
<div>
<div className="font-medium">Engagement Manager</div>
<div>Oliver Wyman</div>
<div className="text-sm text-neutral-500">Aug 2006 – Aug 2010</div>
</div>
</div>
</section>


<section className="space-y-3">
<h2 className="text-xl font-medium">Advisor & Board Experience</h2>
<div className="space-y-2 text-neutral-700 dark:text-neutral-300">
<div>
<div className="font-medium">Chairman of the Board & Advisory Board Member</div>
<div>Onbrane</div>
<div className="text-sm text-neutral-500">Jan 2021 – Present</div>
</div>
<div>
<div className="font-medium">Advisor & Mentor</div>
<div>Rep’d</div>
<div className="text-sm text-neutral-500">Dec 2021 – Present</div>
</div>
<div>
<div className="font-medium">Board Treasurer</div>
<div>The Azure</div>
<div className="text-sm text-neutral-500">Oct 2023 – Present</div>
</div>
</div>
</section>


<section className="space-y-3">
<h2 className="text-xl font-medium">Education</h2>
<div className="text-neutral-700 dark:text-neutral-300">
<div className="font-medium">
B.S. in Economics (concentration in Accounting, Legal Studies, and Entrepreneurship)
</div>
<div>The Wharton School, University of Pennsylvania</div>
<div className="text-sm text-neutral-500">Class of 2006</div>
</div>
</section>


<section className="space-y-3">
<h2 className="text-xl font-medium">Skills & Hobbies</h2>
<ul className="list-disc pl-6 text-neutral-700 dark:text-neutral-300 space-y-1">
<li>Marathon runner — 2:39 PR; 35+ marathons & ultras</li>
<li>Daily NYT crossword solver</li>
<li>Ohio State Buckeye football enthusiast</li>
<li>Peacemaker, negotiator, collaborator</li>
</ul>
</section>
</main>
);
}