const STORAGE = {
  notes: "travelhq_notes",
  checks: "travelhq_checks",
  reservations: "travelhq_reservations",
};

const tripSections = [
  {
    title: "LA → Vegas → LA",
    desc: "전체 흐름을 보여주는 마스터 일정. 나중에 세부 일정이 생기면 이 카드만 눌러도 전체 맥락을 바로 볼 수 있게 설계했어요.",
    status: "기본 여행 동선",
    dot: "var(--blue)",
    meta: [
      ["기간", "9/23 - 10/4"],
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
    hero: "https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=1200&q=85",
  },
];

const flight = [
  {
    id: "flight-out",
    title: "출발편 (OZ202)",
    value: "입력됨",
    status: "확정",
    desc: "인천(ICN) 9/23 12:40 출발 → 로스앤젤레스(LAX) 9/23 07:50 도착",
    meta: [["출발", "9/23 12:40 (ICN)"], ["도착", "9/23 07:50 (LAX)"], ["편명", "아시아나 OZ202"]],
  },
  {
    id: "flight-return",
    title: "복귀편 (OZ201)",
    value: "입력됨",
    status: "확정",
    desc: "로스앤젤레스(LAX) 10/3 10:10 출발 → 인천(ICN) 10/4 15:20 도착",
    meta: [["출발", "10/3 10:10 (LAX)"], ["도착", "10/4 15:20 (ICN)"], ["편명", "아시아나 OZ201"]],
  },
];

const stay = [
  {
    id: "stay-la",
    title: "LA 숙소",
    value: "미정",
    status: "지역별로 분리",
    desc: "체크인/체크아웃 시간, 조식 여부, 주차비를 메모하기 좋게 만들었습니다.",
    meta: [["호텔", "미정"], ["체크인", "미정"], ["체크아웃", "미정"], ["주차", "미정"]],
  },
  {
    id: "stay-vegas",
    title: "Vegas 숙소",
    value: "미정",
    status: "스트립 중심",
    desc: "가까운 호텔명만 있어도 동선 계획이 훨씬 쉬워집니다.",
    meta: [["호텔", "미정"], ["체크인", "미정"], ["체크아웃", "미정"], ["리조트피", "미정"]],
  },
];

const car = [
  {
    id: "car-main",
    title: "렌트카",
    value: "미정",
    status: "픽업 / 반납 메모",
    desc: "공항 픽업인지, 다운타운 픽업인지 적어두면 바로 쓸 수 있습니다.",
    meta: [["업체", "미정"], ["픽업", "미정"], ["반납", "미정"], ["보험", "미정"]],
  },
  {
    id: "car-driving",
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

function mapsEmbedUrl(query) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`;
}

function isMapPlace(place) {
  const genericWords = ["체크인", "체크아웃", "시차", "출발", "휴게", "식사", "늦잠", "오픈런", "숙소", "공항 이동"];
  return place && !place.includes("→") && !genericWords.some(word => place.includes(word));
}

function mapsDirectionsUrl(item) {
  const places = item.schedule.map(slot => slot[1]).filter(isMapPlace);
  if (places.length < 2) return mapsSearchUrl(item.mapQuery || item.title);
  const origin = places[0];
  const destination = places[places.length - 1];
  const waypoints = places.slice(1, -1).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function scheduleSummary(item) {
  return [
    `DAY ${item.day} · ${item.date} ${item.week} · ${item.title}`,
    item.desc,
    `숙소 기준: ${item.stayTime}`,
    ...item.schedule.map(slot => `${slot[0]} - ${slot[1]}: ${slot[2]}`),
    `팁: ${item.tip}`,
  ].join("\n");
}

function placeMarkup(place) {
  if (!isMapPlace(place)) return `<strong>${place}</strong>`;
  return `<a class="place-link" href="${mapsSearchUrl(place)}" target="_blank" rel="noopener noreferrer"><strong>${place}</strong></a>`;
}

async function copyText(text, doneLabel = "복사됨") {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast(doneLabel);
}

function showToast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const toast = el("div", "toast", message);
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => toast.remove(), 1800);
}

const locationLabels = {
  west: "LA 서쪽",
  north: "LA 북쪽",
  northeast: "북동쪽 이동",
  vegasEast: "Strip 동쪽",
  vegasWest: "Vegas 외곽",
  east: "LA 동쪽",
  airport: "공항권",
};

const scheduleData = [
  {
    day: 1, date: "9/23", week: "수", type: "la", city: "LA", title: "LA 도착 · 시차 적응 및 휴식",
    desc: "오전 7:50 LAX 도착. 렌터카 픽업 후 산타모니카 등 서쪽 해안에서 가볍게 시차 적응.",
    img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1000&q=85",
    area: "LA 서쪽 해안 · 산타모니카",
    stayTime: "LA 임시 숙소 기준 30-50분",
    position: "west",
    mapQuery: "Santa Monica Pier",
    tip: "장시간 비행 후 첫날이므로 무리하지 말고 컨디션 관리에 집중하세요.",
    schedule: [["07:50", "LAX 도착", "입국 심사 (OZ202)"], ["오전", "렌터카 픽업", "렌터카 센터 이동 및 차량 수령"], ["오후", "Santa Monica", "해변 산책 및 가벼운 점심"], ["저녁", "숙소 체크인", "일찍 휴식 및 시차 적응"]],
  },
  {
    day: 2, date: "9/24", week: "목", type: "la must", city: "LA", title: "LA 다저스 경기 관람",
    desc: "이번 여행의 목표! 다저스 스타디움에서 열리는 LA 다저스 경기 직관.",
    img: "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=1000&q=85",
    area: "LA 동북부 · Dodger Stadium",
    stayTime: "숙소에서 경기장 이동",
    position: "northeast",
    mapQuery: "Dodger Stadium",
    tip: "다저스 스타디움 주차 및 입장 시간을 고려해 경기 시작 전 여유 있게 도착하세요.",
    schedule: [["오전", "여유로운 오전", "전날 시차 피로 회복"], ["점심", "다운타운 이동", "경기장 근처 이동 및 식사 후보 확인"], ["오후", "Dodger Stadium", "경기장 도착, 굿즈샵 구경 및 입장"], ["저녁", "LA 다저스 직관", "홈경기 관람!"]],
  },
  {
    day: 3, date: "9/25", week: "금", type: "la", city: "LA", title: "할리우드 · 베벌리힐즈 · 그리피스",
    desc: "LA 대표 관광 압축. 저녁은 그리피스 야경.",
    img: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1000&q=85",
    area: "LA 북부/중부 · Hollywood-Beverly-Griffith",
    stayTime: "LA 임시 숙소 기준 각 구간 20-45분",
    position: "north",
    mapQuery: "Griffith Observatory",
    tip: "주말 전 금요일 그리피스는 혼잡하므로 일몰 1시간 전 도착 추천.",
    schedule: [["오전", "Hollywood Walk of Fame", "사진 포인트 위주로 짧게"], ["점심", "Beverly Hills", "이동 중 식사 후보 확인"], ["오후", "Rodeo Drive", "거리 구경, 카페 쉬는 시간"], ["저녁", "Griffith Observatory", "일몰 전 도착, 야경 보고 복귀"]],
  },
  {
    day: 4, date: "9/26", week: "토", type: "la", city: "LA", title: "Universal Studios Hollywood",
    desc: "미국식 체험형 관광 핵심. 하루 통째로 배정.",
    img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=85",
    area: "LA 북쪽 · Universal City",
    stayTime: "LA 임시 숙소 기준 25-55분",
    position: "north",
    mapQuery: "Universal Studios Hollywood",
    tip: "운영시간은 날짜별로 다르므로 공식 캘린더 확인 후 티켓 예약.",
    schedule: [["오전", "오픈런", "입장 직후 인기 어트랙션 우선"], ["점심", "파크 내부 식사", "대기시간 보며 가까운 곳 선택"], ["오후", "스튜디오 투어 / 해리포터 존", "앱 대기시간 기준으로 동선 조정"], ["저녁", "CityWalk", "식사 후 여유 있게 복귀"]],
  },
  {
    day: 5, date: "9/27", week: "일", type: "vegas move", city: "Vegas", title: "LA → Las Vegas 이동",
    desc: "오전 출발, 오후 체크인, 밤에는 스트립 야경.",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    area: "LA에서 북동쪽 · Mojave 경유",
    stayTime: "LA 출발 기준 4-5시간 운전",
    position: "northeast",
    mapQuery: "Los Angeles to Las Vegas",
    tip: "이동일에는 욕심내지 말고 스트립 야경만 가볍게.",
    schedule: [["오전", "LA 출발", "간식/물 준비 후 고속도로 이동"], ["점심", "중간 휴게", "Barstow 근처 휴식 후보"], ["오후", "Las Vegas 체크인", "주차, 짐 정리, 휴식"], ["저녁", "Strip / Bellagio Fountains", "첫날 야경만 가볍게"]],
  },
  {
    day: 6, date: "9/28", week: "월", type: "vegas must", city: "Vegas", title: "Sphere 필수 · The Wizard of Oz",
    desc: "이번 여행의 베가스 핵심 체험. 17:00 공연 기준으로 일정 고정.",
    img: "https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=1000&q=85",
    area: "Vegas Strip 동쪽 · Sphere",
    stayTime: "Vegas Strip 숙소 기준 10-25분",
    position: "vegasEast",
    mapQuery: "Sphere Las Vegas",
    tip: "Ticketmaster 안내상 공연 시간 시작 후 늦은 입장이 불가하다. 문은 공연 45분 전 오픈 안내.",
    schedule: [["오전", "늦잠 / 브런치", "전날 이동 피로 회복"], ["오후", "Bellagio · Venetian", "가벼운 호텔 투어"], ["17:00", "Sphere · The Wizard of Oz", "필수 예약 일정"], ["저녁", "가벼운 식사 / 스트립", "공연 후 여유"]],
  },
  {
    day: 7, date: "9/29", week: "화", type: "vegas", city: "Vegas", title: "그랜드캐년 or 베가스 여유일",
    desc: "체력에 따라 선택. 강행하면 그랜드캐년, 쉬려면 쇼핑·수영장.",
    img: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1000&q=85",
    area: "선택 일정 · Grand Canyon West 또는 Vegas 시내",
    stayTime: "그랜드캐년 선택 시 편도 약 2-2.5시간",
    position: "vegasWest",
    mapQuery: "Grand Canyon West",
    tip: "그랜드캐년은 이동 시간이 길다. 전날 과음 금지.",
    schedule: [["옵션 A", "Grand Canyon 투어", "사전 예약, 이른 출발 권장"], ["옵션 B", "수영장 · 쇼핑 · 카지노", "체력 회복 중심의 휴식형 일정"], ["저녁", "Vegas 마지막 식사", "예약 가능한 레스토랑 후보 확인"], ["밤", "마지막 베가스 야경", "High Roller / Sphere 외관"]],
  },
  {
    day: 8, date: "9/30", week: "수", type: "la move", city: "LA", title: "Las Vegas → LA 복귀",
    desc: "복귀 이동일. 저녁은 가볍게.",
    img: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=1000&q=85",
    area: "Vegas에서 남서쪽 · LA 복귀",
    stayTime: "Vegas 출발 기준 4.5-6시간 운전",
    position: "northeast",
    mapQuery: "Las Vegas to Los Angeles",
    tip: "복귀일은 피로가 크므로 일정 최소화.",
    schedule: [["오전", "Vegas 체크아웃", "점심 전 출발 목표"], ["점심", "중간 휴게", "운전 피로 보며 휴식"], ["오후", "LA 도착", "숙소 체크인, 짐 정리"], ["저녁", "가벼운 식사", "한인타운 후보"]],
  },
  {
    day: 9, date: "10/1", week: "목", type: "la", city: "LA", title: "Citadel Outlets 쇼핑",
    desc: "후반부 첫 풀데이. 쇼핑 중심.",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85",
    area: "LA 동쪽 · Commerce",
    stayTime: "LA 임시 숙소 기준 25-50분",
    position: "east",
    mapQuery: "Citadel Outlets",
    tip: "영업시간 확인 후 방문. 렌터카 있을 때 가기 좋음.",
    schedule: [["오전", "느긋한 출발", "전날 이동 피로 고려"], ["점심", "Citadel Outlets 도착", "식사 후 쇼핑 시작"], ["오후", "Citadel Outlets", "브랜드별 우선순위로 이동"], ["저녁", "숙소 복귀", "구매품 정리, 캐리어 무게 확인"]],
  },
  {
    day: 10, date: "10/2", week: "금", type: "la", city: "LA", title: "여유일 및 추가 관광",
    desc: "일정을 마무리하며 방문하지 못한 곳이나 여유로운 자유 일정.",
    img: "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=1000&q=85",
    area: "LA 서쪽 해안 또는 다운타운",
    stayTime: "LA 임시 숙소 기준 20-55분",
    position: "west",
    mapQuery: "Venice Canals Los Angeles",
    tip: "마지막 온전한 하루이므로 아쉬움이 남지 않게 계획해 보세요.",
    schedule: [["오전", "Venice Canals / Beach", "산책, 사진, 해변 분위기"], ["점심", "Abbot Kinney", "카페/브런치 후보"], ["오후", "선택 관광", "쇼핑 추가 또는 해변 휴식"], ["저녁", "마지막 만찬", "분위기 좋은 레스토랑 예약"]],
  },
  {
    day: 11, date: "10/3", week: "토", type: "la move", city: "LA", title: "LAX 이동 및 귀국",
    desc: "오전 10:10 비행기(OZ201) 탑승을 위해 공항으로 일찍 이동합니다.",
    img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=85",
    area: "LA 서쪽 · LAX 공항권",
    stayTime: "LA 숙소에서 공항으로 이동",
    position: "airport",
    mapQuery: "LAX Airport",
    tip: "국제선 출국 및 렌터카 반납을 위해 늦어도 비행 3시간 전 공항 도착을 권장합니다.",
    schedule: [["새벽/아침", "체크아웃 및 렌터카 반납", "빠른 이동 및 공항 도착"], ["07:00", "LAX 공항 수속", "출국 수속 및 짐 부치기"], ["10:10", "LA 출발", "아시아나 OZ201 탑승"]],
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
  activeDayIndex = Math.min(activeDayIndex, Math.max(visibleSchedule.length - 1, 0));
  renderDayRail();
  renderActiveScheduleCard(false);
}

function createScheduleCard(item) {
  const card = el("article", "day-card");
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
        <div class="location-card">
          <iframe class="inline-map" title="${item.title} 위치 지도" src="${mapsEmbedUrl(item.mapQuery || item.title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          <div class="location-copy">
            <span>대략 위치</span>
            <strong>${locationLabels[item.position] || item.area}</strong>
            <small>${item.area}</small>
          </div>
        </div>
        <div class="logistics">
          <div><span>숙소 기준</span><strong>${item.stayTime}</strong></div>
      </div>
      <div class="timeline">
        ${item.schedule.map(slot => `<div class="timeline-row"><div class="timeline-time">${slot[0]}</div><div>${placeMarkup(slot[1])}<span>${slot[2]}</span></div></div>`).join("")}
      </div>
      <div class="day-tip">${item.tip}</div>
      <div class="day-actions">
        <a class="small-btn" href="${mapsDirectionsUrl(item)}" target="_blank" rel="noopener noreferrer">하루 루트</a>
        <a class="small-btn" href="${mapsSearchUrl(item.title)}" target="_blank" rel="noopener noreferrer">구글맵</a>
        <button class="small-btn" type="button" data-copy="${item.day}">일정 복사</button>
        <button class="small-btn" type="button" data-open="${item.day}">상세 열기</button>
      </div>
    </div>
  `;
  card.querySelector("[data-open]").addEventListener("click", () => openScheduleModal(item));
  card.querySelector("[data-copy]").addEventListener("click", () => copyText(scheduleSummary(item), "하루 일정 복사됨"));
  return card;
}

function renderDayRail() {
  const rail = document.getElementById("dayRail");
  if (!rail) return;
  rail.innerHTML = visibleSchedule.map((item, index) => `
    <button class="day-pill ${index === activeDayIndex ? "active" : ""}" type="button" data-day-index="${index}">
      <span>DAY ${item.day}</span>
      <strong>${item.week}</strong>
    </button>
  `).join("");
  rail.querySelectorAll("[data-day-index]").forEach(btn => {
    btn.addEventListener("click", () => scrollToDay(Number(btn.dataset.dayIndex)));
  });
}

function renderActiveScheduleCard(animate = true) {
  const list = document.getElementById("scheduleList");
  if (!list) return;
  list.innerHTML = "";
  if (!visibleSchedule.length) {
    list.innerHTML = `<article class="day-card"><div class="day-body"><h4>일정 없음</h4><p>선택한 필터에 해당하는 일정이 없습니다.</p></div></article>`;
    updateDayStatus();
    updateBriefing();
    return;
  }
  const item = visibleSchedule[activeDayIndex];
  const card = createScheduleCard(item);
  if (animate) {
    card.classList.add("day-card-enter");
    requestAnimationFrame(() => card.classList.remove("day-card-enter"));
  }
  list.appendChild(card);
  updateDayStatus();
  renderDayRail();
  updateBriefing();
}

function updateBriefing() {
  const title = document.getElementById("briefingTitle");
  const desc = document.getElementById("briefingDesc");
  const route = document.getElementById("briefingRoute");
  if (!title || !desc || !route) return;
  if (!visibleSchedule.length) {
    title.textContent = "선택한 일정이 없습니다";
    desc.textContent = "필터를 바꾸면 다시 표시됩니다.";
    route.href = "#";
    return;
  }
  const item = visibleSchedule[activeDayIndex];
  const nextPlace = item.schedule[0]?.[1] || item.title;
  title.textContent = `DAY ${item.day} · ${item.title}`;
  desc.textContent = `${nextPlace}부터 시작 · ${item.stayTime}`;
  route.href = mapsDirectionsUrl(item);
}

function reservationValue(item, label) {
  const saved = readJSON(STORAGE.reservations, {});
  return saved[item.id]?.[label] || item.meta.find(([name]) => name === label)?.[1] || "미정";
}

function isReservationFilled(item) {
  const saved = readJSON(STORAGE.reservations, {});
  return Object.values(saved[item.id] || {}).some(value => value.trim() && value.trim() !== "미정");
}

function renderEntityList(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const filled = isReservationFilled(item);
    const card = el("article", "entity");
    card.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <div class="meta">
        ${item.meta.map(([label]) => `<div class="meta-row"><span>${label}</span><strong>${reservationValue(item, label)}</strong></div>`).join("")}
      </div>
      <div class="status-line"><span class="status-dot ${filled ? "filled" : ""}"></span>${filled ? "입력됨" : item.status}</div>
      <div class="mini-actions">
        <button class="small-btn" type="button" data-edit="${item.id}">${filled ? "수정" : "입력"}</button>
        ${filled ? `<button class="small-btn ghost-danger" type="button" data-reset="${item.id}">초기화</button>` : ""}
      </div>
    `;
    card.querySelector("[data-edit]").addEventListener("click", () => openEntityEditor(containerId, item));
    card.querySelector("[data-reset]")?.addEventListener("click", () => resetEntity(containerId, items, item));
    container.appendChild(card);
  });
}

function openEntityEditor(containerId, item) {
  const saved = readJSON(STORAGE.reservations, {});
  const current = saved[item.id] || {};
  document.getElementById("detailModal").classList.add("open");
  document.getElementById("detailModal").setAttribute("aria-hidden", "false");
  document.getElementById("modalHero").classList.add("is-empty");
  document.getElementById("modalHero").innerHTML = "";
  document.getElementById("modalKicker").textContent = "예약 정보";
  document.getElementById("modalTitle").textContent = item.title;
  document.getElementById("modalDesc").textContent = "확정 전에는 대략적인 후보만 적어도 됩니다. 이 브라우저에 자동 저장됩니다.";
  document.getElementById("modalMeta").innerHTML = `
    <form class="edit-form" id="entityForm">
      ${item.meta.map(([label, fallback]) => `
        <label class="field">
          <span>${label}</span>
          <input name="${label}" value="${current[label] || (fallback === "미정" ? "" : fallback)}" placeholder="미정" autocomplete="off" />
        </label>
      `).join("")}
      <label class="field field-wide">
        <span>메모</span>
        <textarea name="메모" placeholder="예약번호, 결제카드, 취소기한 등">${current["메모"] || ""}</textarea>
      </label>
    </form>
  `;
  document.getElementById("modalActions").innerHTML = `
    <button class="small-btn" type="submit" form="entityForm">저장</button>
    <button class="small-btn" type="button" id="cancelEntityEdit">닫기</button>
  `;
  document.getElementById("cancelEntityEdit").addEventListener("click", closeModal);
  document.getElementById("entityForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saved[item.id] = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value).trim() || "미정"]));
    writeJSON(STORAGE.reservations, saved);
    renderEntityList(containerId, containerId === "sectionFlight" ? flight : containerId === "sectionStay" ? stay : car);
    updateStats();
    closeModal();
    showToast("예약 정보 저장됨");
  });
}

function resetEntity(containerId, items, item) {
  const saved = readJSON(STORAGE.reservations, {});
  delete saved[item.id];
  writeJSON(STORAGE.reservations, saved);
  renderEntityList(containerId, items);
  updateStats();
  showToast("예약 정보 초기화됨");
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

  const reservationItems = [...flight, ...stay, ...car];
  const pending = reservationItems.filter(item => !isReservationFilled(item)).length;
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
  document.getElementById("modalHero").classList.remove("is-empty");
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
  document.getElementById("modalHero").classList.remove("is-empty");
  document.getElementById("modalHero").innerHTML = `<img src="${item.img}" alt="${item.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox=\"0 0 1200 800\"><rect width="1200" height="800" fill=\"#101423\"/><text x=\"70\" y=\"700\" fill=\"#dce7ff\" font-size=\"56\" font-family=\"Arial\">Travel HQ</text></svg>`)}'">`;
  document.getElementById("modalKicker").textContent = `${item.date} · ${item.week} · ${item.city}`;
  document.getElementById("modalTitle").textContent = item.title;
  document.getElementById("modalDesc").textContent = item.tip;
  document.getElementById("modalMeta").innerHTML = `
    <div class="meta-card"><span>대략 위치</span><strong>${locationLabels[item.position] || item.area}</strong></div>
    <div class="meta-card"><span>숙소 기준</span><strong>${item.stayTime}</strong></div>
    ${item.schedule.map(slot => `<div class="meta-card"><span>${slot[0]}</span><strong>${isMapPlace(slot[1]) ? `<a class="place-link" href="${mapsSearchUrl(slot[1])}" target="_blank" rel="noopener noreferrer">${slot[1]}</a>` : slot[1]}<br>${slot[2]}</strong></div>`).join("")}
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

function scrollToDay(index, animate = true) {
  if (!visibleSchedule.length) return;
  activeDayIndex = Math.max(0, Math.min(index, visibleSchedule.length - 1));
  renderActiveScheduleCard(animate);
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
  document.querySelectorAll("[data-carousel]").forEach(btn => {
    btn.addEventListener("click", () => {
      scrollToDay(activeDayIndex + (btn.dataset.carousel === "next" ? 1 : -1));
    });
  });
  document.getElementById("copyDayBtn").addEventListener("click", () => {
    const item = visibleSchedule[activeDayIndex];
    if (item) copyText(scheduleSummary(item), "하루 일정 복사됨");
  });
  document.getElementById("copyAllBtn").addEventListener("click", () => {
    copyText(scheduleData.map(scheduleSummary).join("\n\n---\n\n"), "전체 일정 복사됨");
  });
  const viewport = document.getElementById("scheduleViewport");
  let startX = 0;
  let startY = 0;
  let dragging = false;
  viewport.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    startY = event.clientY;
    dragging = true;
  });
  viewport.addEventListener("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;
    const diffX = event.clientX - startX;
    const diffY = event.clientY - startY;
    if (Math.abs(diffX) < 44 || Math.abs(diffX) < Math.abs(diffY)) return;
    scrollToDay(activeDayIndex + (diffX < 0 ? 1 : -1));
  });
  viewport.addEventListener("pointercancel", () => {
    dragging = false;
  });
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
