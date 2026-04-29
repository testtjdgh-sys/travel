const STORAGE = {
  notes: "travelhq_notes",
  checks: "travelhq_checks",
};

const tripSections = [
  {
    title: "LA → Vegas → LA",
    desc: "전체 흐름을 보여주는 마스터 일정. 나중에 세부 일정이 생기면 이 카드만 눌러도 전체 맥락을 바로 볼 수 있게 설계했어요.",
    status: "기본 여행 동선",
    dot: "var(--blue)",
    meta: [
      ["기간", "9/25 - 10/5"],
      ["형태", "LA + Vegas"],
      ["핵심", "요일별 일정"],
    ],
    actions: [
      { label: "일정 상세", href: "#scheduleSection", kind: "link" },
      { label: "메모로", href: "#notes", kind: "link" },
    ],
    hero: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "예약 우선순위",
    desc: "아직 미정이어도 우선순위를 잃지 않도록 가장 먼저 챙길 것만 선별해 둔 슬롯입니다.",
    status: "확정 필요",
    dot: "var(--orange)",
    meta: [
      ["항공", "미정"],
      ["숙소", "미정"],
      ["렌트카", "미정"],
    ],
    actions: [
      { label: "체크리스트", href: "#checklist", kind: "link" },
      { label: "모달 열기", action: "modal", kind: "button" },
    ],
    hero: "https://images.unsplash.com/photo-1533659828870-95ee305cee3f?auto=format&fit=crop&w=1200&q=85",
  },
];

const flight = [
  {
    title: "출발편",
    value: "미정",
    status: "나중에 넣기",
    desc: "도시 / 날짜 / 시간 / 항공사 / 편명",
    meta: [["출발", "미정"], ["도착", "미정"]],
  },
  {
    title: "복귀편",
    value: "미정",
    status: "나중에 넣기",
    desc: "귀국 일정만 먼저 적어도 충분히 유용합니다.",
    meta: [["출발", "미정"], ["도착", "미정"]],
  },
];

const stay = [
  {
    title: "LA 숙소",
    value: "미정",
    status: "지역별로 분리",
    desc: "체크인/체크아웃 시간, 조식 여부, 주차비를 메모하기 좋게 만들었습니다.",
    meta: [["체크인", "미정"], ["체크아웃", "미정"]],
  },
  {
    title: "Vegas 숙소",
    value: "미정",
    status: "스트립 중심",
    desc: "가까운 호텔명만 있어도 동선 계획이 훨씬 쉬워집니다.",
    meta: [["체크인", "미정"], ["체크아웃", "미정"]],
  },
];

const car = [
  {
    title: "렌트카",
    value: "미정",
    status: "픽업 / 반납 메모",
    desc: "공항 픽업인지, 다운타운 픽업인지 적어두면 바로 쓸 수 있습니다.",
    meta: [["보험", "미정"], ["반납", "미정"]],
  },
  {
    title: "운전 메모",
    value: "미정",
    status: "운전 구간",
    desc: "LA 시내 / Vegas 이동 / 공항 반납 같은 주요 구간을 적기 좋습니다.",
    meta: [["주요 구간", "미정"], ["주차", "미정"]],
  },
];

const checks = [
  ["항공편 확정", "출발/도착 시간 기록"],
  ["숙소 1차 확보", "LA / Vegas 숙소 분리"],
  ["렌트카 견적 비교", "보험 포함 총액 확인"],
  ["핵심 일정 재확인", "Sphere / Universal 우선"],
  ["여권 / ESTA 확인", "만료일 체크"],
];

const hero = {
  title: "LA · Vegas 일정표",
  desc: "요일별 일정을 먼저 보여주고, 항공·숙소·렌트카는 바로 참고할 수 있게 붙여 두었어요.",
  image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=85",
};

let visibleSchedule = [];
let activeDayIndex = 0;

function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const scheduleData = [
  {
    day: 1, date: "9/25", week: "금", type: "la", city: "LA", title: "LA 도착 · 산타모니카 적응",
    desc: "첫날은 시차 적응. 해변 산책과 가벼운 저녁만.",
    img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1000&q=85",
    area: "LA 서쪽 해안 · 산타모니카",
    stayTime: "LA 임시 숙소 기준 30-50분",
    tip: "첫날은 컨디션 관리가 핵심. 야간 장거리 운전은 비추천.",
    schedule: [["도착 후", "LAX → 체크인", "입국, 렌터카/이동, 짐 정리"], ["저녁", "Santa Monica Pier", "해변 산책, 가벼운 식사, 노을 보기"], ["밤", "시차 적응", "근처 마트 들른 뒤 일찍 쉬기"]],
  },
  {
    day: 2, date: "9/26", week: "토", type: "la", city: "LA", title: "할리우드 · 베벌리힐즈 · 그리피스",
    desc: "LA 대표 관광 압축. 저녁은 그리피스 야경.",
    img: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1000&q=85",
    area: "LA 북부/중부 · Hollywood-Beverly-Griffith",
    stayTime: "LA 임시 숙소 기준 각 구간 20-45분",
    tip: "주말 그리피스는 혼잡하므로 일몰 1시간 전 도착 추천.",
    schedule: [["오전", "Hollywood Walk of Fame", "사진 포인트 위주로 짧게"], ["점심", "Beverly Hills", "이동 중 식사 후보 확인"], ["오후", "Rodeo Drive", "거리 구경, 카페 쉬는 시간"], ["저녁", "Griffith Observatory", "일몰 전 도착, 야경 보고 복귀"]],
  },
  {
    day: 3, date: "9/27", week: "일", type: "la", city: "LA", title: "Universal Studios Hollywood",
    desc: "미국식 체험형 관광 핵심. 하루 통째로 배정.",
    img: "https://images.unsplash.com/photo-1569135219920-00898b584df4?auto=format&fit=crop&w=1000&q=85",
    area: "LA 북쪽 · Universal City",
    stayTime: "LA 임시 숙소 기준 25-55분",
    tip: "운영시간은 날짜별로 다르므로 공식 캘린더 확인 후 티켓 예약.",
    schedule: [["오전", "오픈런", "입장 직후 인기 어트랙션 우선"], ["점심", "파크 내부 식사", "대기시간 보며 가까운 곳 선택"], ["오후", "스튜디오 투어 / 해리포터 존", "앱 대기시간 기준으로 동선 조정"], ["저녁", "CityWalk", "식사 후 여유 있게 복귀"]],
  },
  {
    day: 4, date: "9/28", week: "월", type: "vegas move", city: "Vegas", title: "LA → Las Vegas 이동",
    desc: "오전 출발, 오후 체크인, 밤에는 스트립 야경.",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    area: "LA에서 북동쪽 · Mojave 경유",
    stayTime: "LA 출발 기준 4-5시간 운전",
    tip: "이동일에는 욕심내지 말고 스트립 야경만 가볍게.",
    schedule: [["오전", "LA 출발", "간식/물 준비 후 고속도로 이동"], ["점심", "중간 휴게", "Barstow 근처 휴식 후보"], ["오후", "Las Vegas 체크인", "주차, 짐 정리, 휴식"], ["저녁", "Strip / Bellagio Fountains", "첫날 야경만 가볍게"]],
  },
  {
    day: 5, date: "9/29", week: "화", type: "vegas must", city: "Vegas", title: "Sphere 필수 · The Wizard of Oz",
    desc: "이번 여행의 베가스 핵심 체험. 17:00 공연 기준으로 일정 고정.",
    img: "https://images.unsplash.com/photo-1695668768015-418077d78d3e?auto=format&fit=crop&w=1000&q=85",
    area: "Vegas Strip 동쪽 · Sphere",
    stayTime: "Vegas Strip 숙소 기준 10-25분",
    tip: "Ticketmaster 안내상 공연 시간 시작 후 늦은 입장이 불가하다. 문은 공연 45분 전 오픈 안내.",
    schedule: [["오전", "늦잠 / 브런치", "전날 이동 피로 회복"], ["오후", "Bellagio · Venetian", "가벼운 호텔 투어"], ["17:00", "Sphere · The Wizard of Oz", "필수 예약 일정"], ["저녁", "가벼운 식사 / 스트립", "공연 후 여유"]],
  },
  {
    day: 6, date: "9/30", week: "수", type: "vegas", city: "Vegas", title: "그랜드캐년 or 베가스 여유일",
    desc: "체력에 따라 선택. 강행하면 그랜드캐년, 쉬려면 쇼핑·수영장.",
    img: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1000&q=85",
    area: "선택 일정 · Grand Canyon West 또는 Vegas 시내",
    stayTime: "그랜드캐년 선택 시 편도 약 2-2.5시간",
    tip: "그랜드캐년은 이동 시간이 길다. 전날 과음 금지.",
    schedule: [["옵션 A", "Grand Canyon 투어", "사전 예약, 이른 출발 권장"], ["옵션 B", "수영장 · 쇼핑 · 카지노", "체력 회복 중심의 휴식형 일정"], ["저녁", "Vegas 마지막 식사", "예약 가능한 레스토랑 후보 확인"], ["밤", "마지막 베가스 야경", "High Roller / Sphere 외관"]],
  },
  {
    day: 7, date: "10/1", week: "목", type: "la move", city: "LA", title: "Las Vegas → LA 복귀",
    desc: "복귀 이동일. 저녁은 가볍게.",
    img: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=1000&q=85",
    area: "Vegas에서 남서쪽 · LA 복귀",
    stayTime: "Vegas 출발 기준 4.5-6시간 운전",
    tip: "복귀일은 피로가 크므로 일정 최소화.",
    schedule: [["오전", "Vegas 체크아웃", "점심 전 출발 목표"], ["점심", "중간 휴게", "운전 피로 보며 휴식"], ["오후", "LA 도착", "숙소 체크인, 짐 정리"], ["저녁", "가벼운 식사", "한인타운 후보"]],
  },
  {
    day: 8, date: "10/2", week: "금", type: "la", city: "LA", title: "Citadel Outlets 쇼핑",
    desc: "후반부 첫 풀데이. 쇼핑 중심.",
    img: "https://images.unsplash.com/photo-1605902711622-cfb43c4437d1?auto=format&fit=crop&w=1000&q=85",
    area: "LA 동쪽 · Commerce",
    stayTime: "LA 임시 숙소 기준 25-50분",
    tip: "영업시간 확인 후 방문. 렌터카 있을 때 가기 좋음.",
    schedule: [["오전", "느긋한 출발", "전날 이동 피로 고려"], ["점심", "Citadel Outlets 도착", "식사 후 쇼핑 시작"], ["오후", "Citadel Outlets", "브랜드별 우선순위로 이동"], ["저녁", "숙소 복귀", "구매품 정리, 캐리어 무게 확인"]],
  },
  {
    day: 9, date: "10/3", week: "토", type: "la must", city: "LA", title: "스포츠 슬롯 · NBA/MLB 대기",
    desc: "NBA 프리시즌 또는 MLB 포스트시즌 가능성 확인용으로 저녁을 비워둠.",
    img: "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=1000&q=85",
    area: "LA 서쪽 해안 또는 Downtown 경기장",
    stayTime: "LA 임시 숙소 기준 20-55분",
    tip: "현재 확정 가능한 LA 홈 MLB/NBA 일정은 없다. 여행 가까워지면 Lakers/Clippers 프리시즌 또는 Dodgers 포스트시즌 여부 확인.",
    schedule: [["오전", "Venice Canals / Beach", "산책, 사진, 해변 분위기"], ["점심", "Abbot Kinney", "카페/브런치 후보"], ["오후", "Santa Monica", "쇼핑 또는 해변 산책"], ["저녁", "스포츠 슬롯", "NBA/MLB 일정 뜨면 경기로 교체"]],
  },
  {
    day: 10, date: "10/4~10/5", week: "일", type: "la move", city: "LA", title: "마무리 · LAX 이동",
    desc: "마지막 날은 공항 이동 리스크 관리.",
    img: "https://images.unsplash.com/photo-1583404314681-407e4f3757f6?auto=format&fit=crop&w=1000&q=85",
    area: "LA 서쪽 · LAX 공항권",
    stayTime: "LA 임시 숙소 기준 25-70분",
    tip: "국제선은 렌터카 반납과 공항 이동을 넉넉하게.",
    schedule: [["오전", "체크아웃 / 짐 정리", "쇼핑 물품 무게 확인"], ["점심", "가벼운 식사", "공항 이동 전 부담 없는 식사"], ["출국 전", "렌터카 반납 → LAX", "국제선 기준 넉넉하게 도착"]],
  },
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function makeCard(item, kind = "entity") {
  const card = el("article", kind === "trip" ? "card" : "entity");
  const meta = item.meta?.map(([label, value]) => `<div class="meta-row"><span>${label}</span><strong>${value || "미정"}</strong></div>`).join("") ?? "";
  card.innerHTML = `
    <h4>${item.title}</h4>
    <p>${item.desc}</p>
    <div class="meta">${meta}</div>
    <div class="status-line"><span class="status-dot" style="background:${item.dot || "var(--green)"}"></span>${item.status || "미정"}</div>
  `;
  return card;
}

function renderTrips() {
  const container = document.getElementById("sectionTrip");
  if (!container) return;
  container.innerHTML = "";
  tripSections.forEach((item, index) => {
    const card = el("article", "card");
    card.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <div class="meta">
        ${item.meta.map(([label, value]) => `<div class="meta-row"><span>${label}</span><strong>${value}</strong></div>`).join("")}
      </div>
      <div class="status-line"><span class="status-dot" style="background:${item.dot}"></span>${item.status}</div>
      <div class="mini-actions">
        ${item.actions.map(action => action.kind === "link"
          ? `<a class="small-btn" href="${action.href}">${action.label}</a>`
          : `<button class="small-btn" data-action="${action.action}" data-index="${index}">${action.label}</button>`).join("")}
      </div>
    `;
    card.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => openModal(Number(btn.dataset.index)));
    });
    card.style.cursor = "pointer";
    card.addEventListener("click", () => openModal(index));
    container.appendChild(card);
  });
}

function renderSchedule(filter = "all") {
  const filters = document.getElementById("scheduleFilters");
  filters.innerHTML = ["all", "la", "vegas", "must", "move"].map(f => `<button class="filter ${f === filter ? "active" : ""}" data-filter="${f}">${f === "all" ? "전체" : f === "la" ? "LA" : f === "vegas" ? "Vegas" : f === "must" ? "필수" : "이동"}</button>`).join("");
  filters.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
    activeDayIndex = 0;
    renderSchedule(btn.dataset.filter);
  }));

  const list = document.getElementById("scheduleList");
  list.innerHTML = "";
  visibleSchedule = scheduleData.filter(item => filter === "all" || item.type.includes(filter));
  visibleSchedule.forEach((item, index) => {
    const card = el("article", "day-card");
    card.dataset.index = String(index);
    card.innerHTML = `
      <div class="day-banner">
        <img src="${item.img}" alt="${item.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox=\"0 0 1200 800\"><rect width=\"1200\" height=\"800\" fill=\"#101423\"/><circle cx=\"950\" cy=\"180\" r=\"160\" fill=\"#1f2a48\"/><circle cx=\"220\" cy=\"560\" r=\"260\" fill=\"#18223d\"/><text x=\"70\" y=\"700\" fill=\"#dce7ff\" font-size=\"56\" font-family=\"Arial\">Travel HQ</text></svg>`)}'">
        <div class="day-overlay"></div>
        <div class="day-label">${String(item.day).padStart(2, "0")}</div>
        <div class="day-tags">
          <span class="day-tag">${item.date}</span>
          <span class="day-tag">${item.week}</span>
          <span class="day-tag">${item.city}</span>
          ${item.type.includes("must") ? '<span class="day-tag">필수</span>' : ""}
        </div>
      </div>
      <div class="day-body">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <div class="logistics">
          <div><span>위치</span><strong>${item.area}</strong></div>
          <div><span>숙소 기준</span><strong>${item.stayTime}</strong></div>
        </div>
        <div class="timeline">
          ${item.schedule.map(slot => `<div class="timeline-row"><div class="timeline-time">${slot[0]}</div><div><a class="place-link" href="${mapsSearchUrl(slot[1])}" target="_blank" rel="noopener noreferrer"><strong>${slot[1]}</strong></a><span>${slot[2]}</span></div></div>`).join("")}
        </div>
        <div class="day-tip">${item.tip}</div>
        <div class="day-actions">
          <a class="small-btn" href="${mapsSearchUrl(item.title)}" target="_blank" rel="noopener noreferrer">구글맵</a>
          <button class="small-btn" type="button" data-open="${item.day}">상세 열기</button>
        </div>
      </div>
    `;
    card.querySelector("[data-open]").addEventListener("click", () => openScheduleModal(item));
    list.appendChild(card);
  });
  updateDayStatus();
  requestAnimationFrame(() => scrollToDay(activeDayIndex, "auto"));
}

function renderEntityList(containerId, items, kind = "entity") {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const card = el("article", "entity");
    card.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <div class="meta">
        ${item.meta.map(([label, value]) => `<div class="meta-row"><span>${label}</span><strong>${value}</strong></div>`).join("")}
      </div>
      <div class="status-line"><span class="status-dot"></span>${item.status}</div>
      <div class="mini-actions">
        <button class="small-btn" type="button">나중에 입력</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderChecks() {
  const saved = readJSON(STORAGE.checks, Array(checks.length).fill(false));
  const root = document.getElementById("checklist");
  root.innerHTML = "";
  checks.forEach(([title, desc], i) => {
    const row = el("label", "check-item");
    row.innerHTML = `
      <input type="checkbox" ${saved[i] ? "checked" : ""} data-index="${i}" />
      <div>
        <span>${title}</span>
        <small>${desc}</small>
      </div>
    `;
    root.appendChild(row);
  });

  root.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => {
      const next = readJSON(STORAGE.checks, Array(checks.length).fill(false));
      next[Number(input.dataset.index)] = input.checked;
      writeJSON(STORAGE.checks, next);
      updateStats();
    });
  });
}

function updateStats() {
  const saved = readJSON(STORAGE.checks, Array(checks.length).fill(false));
  const done = saved.filter(Boolean).length;
  document.getElementById("checkCount").textContent = `${Math.round((done / checks.length) * 100)}%`;
  document.getElementById("checkLabel").textContent = `${done}/${checks.length} 완료`;

  const pending = 3;
  document.getElementById("pendingCount").textContent = String(pending);
  document.getElementById("confirmedCount").textContent = String(scheduleData.length);
  document.getElementById("confirmedLabel").textContent = "요일별 일정 카드";
}

function renderNotes() {
  const notes = document.getElementById("notes");
  notes.value = localStorage.getItem(STORAGE.notes) || "";
  notes.addEventListener("input", () => localStorage.setItem(STORAGE.notes, notes.value));
}

function openModal(index) {
  const item = tripSections[index];
  document.getElementById("detailModal").classList.add("open");
  document.getElementById("detailModal").setAttribute("aria-hidden", "false");
  document.getElementById("modalHero").innerHTML = `<img src="${item.hero}" alt="${item.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox=\"0 0 1200 800\"><rect width=\"1200\" height=\"800\" fill=\"#101423\"/><text x=\"70\" y=\"700\" fill=\"#dce7ff\" font-size=\"56\" font-family=\"Arial\">Travel HQ</text></svg>`)}'">`;
  document.getElementById("modalKicker").textContent = item.status;
  document.getElementById("modalTitle").textContent = item.title;
  document.getElementById("modalDesc").textContent = item.desc;
  const meta = document.getElementById("modalMeta");
  meta.innerHTML = item.meta.map(([label, value]) => `<div class="meta-card"><span>${label}</span><strong>${value}</strong></div>`).join("");
  const actions = document.getElementById("modalActions");
  actions.innerHTML = `
    <a class="small-btn" href="#sectionFlight">항공 보기</a>
    <a class="small-btn" href="#sectionStay">숙소 보기</a>
    <a class="small-btn" href="#sectionCar">렌트카 보기</a>
  `;
}

function openScheduleModal(item) {
  document.getElementById("detailModal").classList.add("open");
  document.getElementById("detailModal").setAttribute("aria-hidden", "false");
  document.getElementById("modalHero").innerHTML = `<img src="${item.img}" alt="${item.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox=\"0 0 1200 800\"><rect width="1200" height="800" fill=\"#101423\"/><text x=\"70\" y=\"700\" fill=\"#dce7ff\" font-size=\"56\" font-family=\"Arial\">Travel HQ</text></svg>`)}'">`;
  document.getElementById("modalKicker").textContent = `${item.date} · ${item.week} · ${item.city}`;
  document.getElementById("modalTitle").textContent = item.title;
  document.getElementById("modalDesc").textContent = item.tip;
  document.getElementById("modalMeta").innerHTML = `
    <div class="meta-card"><span>위치</span><strong>${item.area}</strong></div>
    <div class="meta-card"><span>숙소 기준</span><strong>${item.stayTime}</strong></div>
    ${item.schedule.map(slot => `<div class="meta-card"><span>${slot[0]}</span><strong><a class="place-link" href="${mapsSearchUrl(slot[1])}" target="_blank" rel="noopener noreferrer">${slot[1]}</a><br>${slot[2]}</strong></div>`).join("")}
  `;
  document.getElementById("modalActions").innerHTML = `<a class="small-btn" href="${mapsSearchUrl(item.title)}" target="_blank" rel="noopener noreferrer">구글맵 열기</a><button class="small-btn" type="button" id="closeFromSchedule">닫기</button>`;
  document.getElementById("closeFromSchedule").addEventListener("click", closeModal);
}

function updateDayStatus() {
  const status = document.getElementById("dayStatus");
  if (!status) return;
  if (!visibleSchedule.length) {
    status.textContent = "일정 없음";
    return;
  }
  const item = visibleSchedule[Math.min(activeDayIndex, visibleSchedule.length - 1)];
  status.textContent = `DAY ${item.day} / ${scheduleData.length} · ${item.date} ${item.week}`;
}

function scrollToDay(index, behavior = "smooth") {
  const list = document.getElementById("scheduleList");
  const card = list?.querySelector(`[data-index="${index}"]`);
  if (!card) return;
  activeDayIndex = Math.max(0, Math.min(index, visibleSchedule.length - 1));
  card.scrollIntoView({ behavior, block: "nearest", inline: "center" });
  updateDayStatus();
}

function closeModal() {
  document.getElementById("detailModal").classList.remove("open");
  document.getElementById("detailModal").setAttribute("aria-hidden", "true");
}

function switchSection(name) {
  document.querySelectorAll("[data-section]").forEach(section => {
    section.classList.toggle("open", section.dataset.section === name);
  });
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === name);
    tab.setAttribute("aria-selected", tab.dataset.tab === name ? "true" : "false");
  });
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tabJump === name);
  });
}

function jumpToSection(name) {
  switchSection(name);
  const target = document.querySelector(`[data-section="${name}"]`);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindNavigation() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      jumpToSection(tab.dataset.tab);
    });
  });
  document.querySelectorAll("[data-tab-jump]").forEach(btn => {
    btn.addEventListener("click", () => {
      jumpToSection(btn.dataset.tabJump);
    });
  });
  document.getElementById("prevDay").addEventListener("click", () => {
    scrollToDay(activeDayIndex - 1);
  });
  document.getElementById("nextDay").addEventListener("click", () => {
    scrollToDay(activeDayIndex + 1);
  });
  document.getElementById("scheduleList").addEventListener("scroll", () => {
    const list = document.getElementById("scheduleList");
    const cards = [...list.querySelectorAll(".day-card")];
    if (!cards.length) return;
    const center = list.scrollLeft + list.clientWidth / 2;
    let closest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const nextDistance = Math.abs(cardCenter - center);
      if (nextDistance < distance) {
        distance = nextDistance;
        closest = index;
      }
    });
    activeDayIndex = closest;
    updateDayStatus();
  }, { passive: true });
  document.getElementById("exportBtn").addEventListener("click", () => window.print());
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target.id === "detailModal") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function init() {
  document.getElementById("heroTitle").textContent = hero.title;
  document.getElementById("heroDesc").textContent = hero.desc;
  document.getElementById("heroMedia").innerHTML = `<img src="${hero.image}" alt="travel hero" loading="eager" onerror="this.src='data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox=\"0 0 1400 900\"><rect width=\"1400\" height=\"900\" fill=\"#101423\"/><circle cx=\"1100\" cy=\"160\" r=\"180\" fill=\"#1f2a48\"/><circle cx=\"250\" cy=\"680\" r=\"300\" fill=\"#18223d\"/><text x=\"80\" y=\"800\" fill=\"#dce7ff\" font-size=\"64\" font-family=\"Arial\">Travel HQ</text></svg>`)}'">`;

  renderSchedule();
  renderEntityList("sectionFlight", flight);
  renderEntityList("sectionStay", stay);
  renderEntityList("sectionCar", car);
  renderChecks();
  renderNotes();
  updateStats();
  bindNavigation();
  switchSection("schedule");
}

init();
