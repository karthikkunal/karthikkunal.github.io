
const menuBtn = document.querySelector("#menuBtn");
const navLinks = document.querySelector("#navLinks");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
}

const revealTargets = document.querySelectorAll(".hero-copy, .profile-card, .section, .content-card, .project-detail, .writing-card, .contact-main, .recruiter-box");
revealTargets.forEach(el => el.classList.add("reveal"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("in");
  });
}, { threshold: 0.12 });

revealTargets.forEach(el => observer.observe(el));

const card = document.querySelector(".profile-card");
if (card) {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}
