const menuBtn = document.querySelector("#menuBtn");
const navLinks = document.querySelector("#navLinks");

if (menuBtn && navLinks) {
  const setMenuOpen = (isOpen) => {
    navLinks.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  };

  menuBtn.addEventListener("click", () => {
    setMenuOpen(menuBtn.getAttribute("aria-expanded") !== "true");
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuBtn.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      event.target instanceof Node &&
      !menuBtn.contains(event.target) &&
      !navLinks.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });
}

document.querySelectorAll(".current-year").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const revealTargets = document.querySelectorAll(
  ".hero-copy, .profile-card, .section, .content-card, .project-detail, .writing-card, .contact-main, .recruiter-box, .discipline-card, .recognition-card"
);

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
} else {
  revealTargets.forEach((element) => element.classList.add("in"));
}

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

const projectGrid = document.querySelector("#projectGrid");
if (projectGrid) {
  const projectCards = [...projectGrid.querySelectorAll("[data-project-card]")];
  const filterButtons = [...document.querySelectorAll("[data-project-filter]")];
  const searchInput = document.querySelector("#projectSearch");
  const projectCount = document.querySelector("#projectCount");
  const filterCounts = new Map();

  projectCards.forEach((project) => {
    const categories = (project.dataset.categories || "").split(" ").filter(Boolean);
    categories.forEach((category) => {
      filterCounts.set(category, (filterCounts.get(category) || 0) + 1);
    });
  });

  filterButtons.forEach((button) => {
    const category = button.dataset.projectFilter;
    const count = category === "all" ? projectCards.length : filterCounts.get(category) || 0;
    const countElement = button.querySelector(".filter-count");
    if (countElement) countElement.textContent = String(count);
    if (category !== "all") {
      button.disabled = count === 0;
    }
  });

  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category");
  let activeCategory = filterButtons.some((button) => button.dataset.projectFilter === requestedCategory)
    ? requestedCategory
    : "all";

  const updateProjectList = () => {
    const search = (searchInput?.value || "").trim().toLocaleLowerCase();
    let visibleCount = 0;

    projectCards.forEach((project) => {
      const categories = (project.dataset.categories || "").split(" ").filter(Boolean);
      const matchesCategory = activeCategory === "all" || categories.includes(activeCategory);
      const matchesSearch = !search ||
        `${project.dataset.search || ""} ${project.textContent}`.toLocaleLowerCase().includes(search);
      const visible = matchesCategory && matchesSearch;

      project.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.projectFilter === activeCategory));
    });
    if (projectCount) {
      const activeButton = filterButtons.find((button) => button.dataset.projectFilter === activeCategory);
      projectCount.textContent = search
        ? `Showing ${visibleCount} of ${projectCards.length} projects`
        : activeCategory === "all"
          ? `Showing all ${visibleCount} projects`
          : `Showing ${visibleCount} ${activeButton?.dataset.filterLabel || activeCategory} projects`;
    }
    projectGrid.classList.toggle("has-results", visibleCount > 0);
    const emptyState = document.querySelector("#emptyProjects");
    if (emptyState) emptyState.hidden = visibleCount > 0;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.projectFilter;
      params.delete("category");
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}#project-browser`);
      updateProjectList();
    });
  });
  searchInput?.addEventListener("input", updateProjectList);
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping) {
      event.preventDefault();
      searchInput?.focus();
    }
  });
  updateProjectList();
}

const securityCanvas = document.querySelector(".security-canvas");
const heroArt = securityCanvas?.closest(".hero-art");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (securityCanvas && heroArt) {
  const context = securityCanvas.getContext("2d");

  if (context) {
    const pointer = { x: 0, y: 0 };
    const vertices = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let frame = 0;
    let previousFrame = 0;
    let lastFrameTime = 0;
    let inView = true;
    let disposed = false;

    for (let bits = 0; bits < 16; bits += 1) {
      vertices.push([
        bits & 1 ? 1 : -1,
        bits & 2 ? 1 : -1,
        bits & 4 ? 1 : -1,
        bits & 8 ? 1 : -1,
      ]);
    }

    const edges = vertices.flatMap((vertex, index) =>
      vertices.flatMap((other, otherIndex) => {
        if (otherIndex <= index) return [];
        const distance = vertex.reduce(
          (total, coordinate, dimension) => total + Number(coordinate !== other[dimension]),
          0
        );
        return distance === 1 ? [[index, otherIndex]] : [];
      })
    );

    const resizeCanvas = () => {
      const bounds = heroArt.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = bounds.width;
      canvasHeight = bounds.height;
      securityCanvas.width = Math.round(canvasWidth * scale);
      securityCanvas.height = Math.round(canvasHeight * scale);
      securityCanvas.style.width = `${canvasWidth}px`;
      securityCanvas.style.height = `${canvasHeight}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      if (prefersReducedMotion.matches) render(0);
    };

    const rotateInPlane = (point, firstAxis, secondAxis, angle) => {
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const first = point[firstAxis] * cosine - point[secondAxis] * sine;
      point[secondAxis] = point[firstAxis] * sine + point[secondAxis] * cosine;
      point[firstAxis] = first;
    };

    function render(timestamp) {
      if (!canvasWidth || !canvasHeight || disposed) return;

      const time = prefersReducedMotion.matches ? 0 : timestamp * 0.0003;
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      const centerX = canvasWidth * 0.5;
      const centerY = canvasHeight * 0.5;
      const size = Math.min(canvasWidth, canvasHeight) * 0.285;
      const scale = size / 1.12;
      const visiblePoints = vertices.map((vertex) => {
        const point = [...vertex];
        rotateInPlane(point, 0, 3, time * 0.8 + pointer.y * 0.35);
        rotateInPlane(point, 1, 2, time * 0.57 + pointer.x * 0.4);
        rotateInPlane(point, 0, 1, time * 0.24);
        rotateInPlane(point, 2, 3, time * 0.45);

        const fourDimensionalPerspective = 4 / (4.4 - point[3] * 0.52);
        let x = point[0] * fourDimensionalPerspective;
        let y = point[1] * fourDimensionalPerspective;
        let z = point[2] * fourDimensionalPerspective;

        const rotateY = time * 0.25 + pointer.x * 0.1;
        const rotatedX = x * Math.cos(rotateY) - z * Math.sin(rotateY);
        z = x * Math.sin(rotateY) + z * Math.cos(rotateY);
        x = rotatedX;

        const rotateX = -0.35 + pointer.y * 0.1;
        const rotatedY = y * Math.cos(rotateX) - z * Math.sin(rotateX);
        z = y * Math.sin(rotateX) + z * Math.cos(rotateX);
        y = rotatedY;

        const projection = 3.8 / (4.7 - z * 0.4);
        return {
          x: centerX + x * projection * scale,
          y: centerY + y * projection * scale,
          depth: z,
          fourth: vertex[3],
        };
      });

      const light = context.createRadialGradient(
        centerX + pointer.x * canvasWidth * 0.19,
        centerY + pointer.y * canvasHeight * 0.19,
        4,
        centerX,
        centerY,
        size * 1.6
      );
      light.addColorStop(0, "rgba(226,255,162,0.11)");
      light.addColorStop(1, "rgba(226,255,162,0)");
      context.fillStyle = light;
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      edges.forEach(([firstIndex, secondIndex]) => {
        const first = visiblePoints[firstIndex];
        const second = visiblePoints[secondIndex];
        const depth = (first.depth + second.depth) * 0.5;
        const fifthAxis = vertices[firstIndex][3] === vertices[secondIndex][3];
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.lineWidth = fifthAxis ? 1.25 : 0.8;
        context.strokeStyle = fifthAxis
          ? `rgba(237,246,222,${0.38 + (depth + 1.3) * 0.13})`
          : `rgba(206,255,116,${0.18 + (depth + 1.3) * 0.11})`;
        context.stroke();
      });

      visiblePoints.forEach((point, index) => {
        const isSignal = vertices[index][0] > 0 && vertices[index][2] > 0;
        const radius = isSignal ? 2.25 : 1.35;
        context.beginPath();
        context.arc(point.x, point.y, radius + Math.max(0, point.depth) * 0.25, 0, Math.PI * 2);
        context.fillStyle = isSignal ? "#e5ff9e" : "rgba(248,246,240,0.78)";
        context.shadowColor = isSignal ? "#d9ff81" : "transparent";
        context.shadowBlur = isSignal ? 12 : 0;
        context.fill();
        context.shadowBlur = 0;
      });

      const pulse = 0.5 + Math.sin(time * 2.4) * 0.5;
      context.beginPath();
      context.arc(centerX, centerY, 3.2 + pulse * 2.2, 0, Math.PI * 2);
      context.fillStyle = "#d8ff7f";
      context.shadowColor = "#d8ff7f";
      context.shadowBlur = 17 + pulse * 13;
      context.fill();
      context.shadowBlur = 0;
    }

    const animate = (timestamp) => {
      frame = 0;
      if (disposed || prefersReducedMotion.matches || !inView) return;
      frame = window.requestAnimationFrame(animate);
      if (timestamp - lastFrameTime < 32) return;
      lastFrameTime = timestamp;
      render(timestamp);
    };

    const startAnimation = () => {
      if (!disposed && inView && !prefersReducedMotion.matches && !frame) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const intersectionObserver = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          inView = entries.some((entry) => entry.isIntersecting);
          if (inView) startAnimation();
          else if (frame) {
            window.cancelAnimationFrame(frame);
            frame = 0;
          }
        }, { threshold: 0.01 })
      : null;

    const resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(resizeCanvas)
      : null;

    const handleMotionPreference = () => {
      if (prefersReducedMotion.matches) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        render(0);
      } else {
        startAnimation();
      }
    };

    const handlePointerMove = (event) => {
      const bounds = heroArt.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      heroArt.style.setProperty("--pointer-rotate-x", `${pointer.y * -4}deg`);
      heroArt.style.setProperty("--pointer-rotate-y", `${pointer.x * 4}deg`);
      if (prefersReducedMotion.matches) render(0);
    };

    const resetPointer = () => {
      pointer.x = 0;
      pointer.y = 0;
      heroArt.style.setProperty("--pointer-rotate-x", "0deg");
      heroArt.style.setProperty("--pointer-rotate-y", "0deg");
      if (prefersReducedMotion.matches) render(0);
    };

    heroArt.addEventListener("pointermove", handlePointerMove);
    heroArt.addEventListener("pointerleave", resetPointer);
    window.addEventListener("resize", resizeCanvas);
    prefersReducedMotion.addEventListener("change", handleMotionPreference);
    resizeObserver?.observe(heroArt);
    intersectionObserver?.observe(heroArt);
    resizeCanvas();
    if (!prefersReducedMotion.matches) startAnimation();
    else render(0);

    window.addEventListener("pagehide", () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      heroArt.removeEventListener("pointermove", handlePointerMove);
      heroArt.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("resize", resizeCanvas);
    }, { once: true });
  }
}
