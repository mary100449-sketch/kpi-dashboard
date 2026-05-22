import { useState, useEffect, useRef } from "react";
import { Edit3, Trash2, TrendingUp, X, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

/* ══════════════════════════════════════
   상수 데이터
══════════════════════════════════════ */
const GOALS = [
  {id:"G1",name:"지속가능한 청소년활동 성장동력 개발",weight:5.5,color:"#6366f1"},
  {id:"G2",name:"실질적 임팩트가 있는 청년사업 브랜드화",weight:4.0,color:"#ec4899"},
  {id:"G3",name:"가치와 기술이 융합된 교육 플랫폼 선도",weight:4.5,color:"#14b8a6"},
  {id:"G4",name:"미래선도형 가치경영 체계 확립",weight:6.0,color:"#f97316"},
];

const KPI_GROUPS = [
  {id:"KG11",goalId:"G1",weight:2.0,name:"청소년 참여 사업 효과성 및 성과진단 이행률"},
  {id:"KG12",goalId:"G1",weight:2.0,name:"지역연계 기반 청소년 활동 확산 성과율"},
  {id:"KG13",goalId:"G1",weight:1.5,name:"청소년 중독 위험성 인식율"},
  {id:"KG21",goalId:"G2",weight:2.0,name:"청년 사업 확장 및 참여 성과 지수"},
  {id:"KG22",goalId:"G2",weight:2.0,name:"청년 사업 운영 통합 효과성"},
  {id:"KG31",goalId:"G3",weight:1.5,name:"창의융합 교육 성과"},
  {id:"KG32",goalId:"G3",weight:2.0,name:"교육 사각지대 청소년 미래교육 보급 성과"},
  {id:"KG33",goalId:"G3",weight:1.0,name:"생애주기별 맞춤형 강좌 이용 활성화율"},
  {id:"KG41",goalId:"G4",weight:1.5,name:"자원 최적화 예산절감액"},
  {id:"KG42",goalId:"G4",weight:1.5,name:"VOC기반 시설개선 이행률"},
  {id:"KG43",goalId:"G4",weight:1.0,name:"업무 표준화 달성률"},
  {id:"KG44",goalId:"G4",weight:2.0,name:"직무전문성 기반 지식자산 확산도"},
];

const mk = (id,gid,name,unit,prev,target,criterion) => ({
  id, groupId:gid, name, unit, prev, target,
  current:null, criterion, scheduledAt:null, records:[], history:[]
});
const defaultKPIs = [
  mk(101,"KG11","청소년 역량변화율","%",8.66,9.53,"전년대비 110%"),
  mk(102,"KG11","성장데이터 확보율","%",40.63,56.88,"전년대비 140%"),
  mk(103,"KG12","협력사업 수","개",5,7,"전년대비 110%"),
  mk(104,"KG12","참여자 수","명",8804,9684,"전년대비 140%"),
  mk(105,"KG13","청소년 중독 위험성 인식율","%",null,90,"보건복지부 81.2% 대비 110%"),
  mk(201,"KG21","청년사업 수","개",7,10,"전년대비 140%"),
  mk(202,"KG21","참여자 수","명",46935,51629,"전년대비 110%"),
  mk(203,"KG22","청년사업 참여 완료율","%",94.6,95.6,"전년대비 101%"),
  mk(204,"KG22","참여자 만족도 효과율","%",95,96,""),
  mk(301,"KG31","만족도","%",90.13,93,"전년대비 103%"),
  mk(302,"KG31","확산도","명",6250,6436,"직전 3개년 평균 110%"),
  mk(303,"KG32","콘텐츠 지원 수","건",1,3,"전년대비 300%"),
  mk(304,"KG32","발굴 인원 수","명",66,100,"전년대비 151%"),
  mk(305,"KG33","강좌 이용 인원","명",236698,260368,"전년대비 110%"),
  mk(401,"KG41","예산절감액","천원",4132,4545,"전년대비 110%"),
  mk(402,"KG42","시설개선 이행 건수","건",14,16,"전년대비 110%"),
  mk(403,"KG43","표준화 달성 항목 수","개",null,5,"핵심 행정 사무 5종"),
  mk(404,"KG44","직원역량 향상 달성률","점",null,3.34,"사전 2.78점 대비 20% 향상"),
  mk(405,"KG44","우수사례 전파 달성률","건",16,20,"직전 3개년 평균 110%"),
];

const HQ_CATS = [
  {id:"HC1",name:"역량·미래교육",color:"#6366f1"},
  {id:"HC2",name:"청년·시민 참여",color:"#ec4899"},
  {id:"HC3",name:"재정 운영",color:"#f97316"},
  {id:"HC4",name:"홍보",color:"#14b8a6"},
];
const mh = (id,catId,name,unit,prev25,target,weight,bsc,criterion,formula,targetNote) => ({
  id, catId, name, unit, prev25, target, weight, bsc,
  criterion, formula, targetNote:targetNote||null, monthlyLogs:[]
});
const defaultHQKPIs = [
  mh("H01","HC1","역량관리플랫폼 사업리포트 발급 수","건",5,5,1.5,"C 고객","5건 (정기프로그램 1건 필수)","리포트 발급 수","2025년 실적: 5건"),
  mh("H02","HC1","미래교육 보급률","명",23670,20185,1.5,"C 고객","목표 인원 달성 시 만점","미래교육 보급 인원","2026년 목표: 20,185명 / 2025년 실적: 23,670명"),
  mh("H03","HC2","청년 제안 반영률","건",8,10,1.5,"C 고객","제안 반영 건수 목표 달성","반영건수/제안건수","2026년 목표: 10건 / 2025년 실적: 8건"),
  mh("H04","HC3","재정자립률 – 자체수입률","%",42.75,52.58,1.0,"F 재무","52.58% 달성 시 만점","(자체수입액/총수입액)×100","2025년 실적: 42.75%"),
  mh("H05","HC3","재정자립률 – 일반관리 충당률","%",162.91,215.83,1.0,"F 재무","215.83% 달성 시 만점","(자체수입액/행정운영경비)×100","2025년 실적: 162.91%"),
  mh("H06","HC3","효율적 예산 운영률 – 본예산집행률","%",null,96,1.5,"F 재무","96% 이상 만점","(집행액/본예산 총액)×100",null),
  mh("H07","HC4","홍보활동 확대율 – 언론보도","건",28,24,1.0,"C 고객","24건 달성 시 만점","언론보도 건수","2025년 실적: 28건"),
  mh("H08","HC4","홍보활동 확대율 – SNS","건",568,534,1.0,"P 프로세스","534건 달성 시 만점","SNS 게시 건수","2025년 실적: 568건"),
];

const mti = (id,label,target) => ({id,label,target});
const defaultTasks = [
  {id:"T101",goalId:"G1",name:"청소년 활동의 교육가치 입증",
    items:[mti("i1","생활기록부 연계 사업",3),mti("i2","청소년 특허출원",2),mti("i3","교육융합 콘텐츠 발굴",2)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T102",goalId:"G1",name:"민관 협력 기반 사업 브랜드 경쟁력 확보",
    items:[mti("i1","기존 협력기관 유지",3),mti("i2","신규 협력기관 발굴",3)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T103",goalId:"G1",name:"현장 중심의 청소년활동 정체성 회복",
    items:[mti("i1","청소년 체험활동 제공",5),mti("i2","청소년 주도 기획 프로그램 운영",8)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T104",goalId:"G1",name:"능동형 예방중심의 상담 거버넌스 실현",
    items:[mti("i1","중독예방 프로그램 참여 학교",18),mti("i2","외부전문기관 협력 운영",4)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T201",goalId:"G2",name:"청년 성장지원체계 고도화",
    items:[mti("i1","스마트 체크인 시스템 구축",1),mti("i2","청년창업 사업자 등록",3),mti("i3","청년 주도 프로젝트 발굴",10)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T202",goalId:"G2",name:"청년사업 브랜딩 통한 서비스 모델 다각화",
    items:[mti("i1","청취 브랜드 사업 운영",4),mti("i2","인적자원 네트워크 구축",1)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T301",goalId:"G3",name:"공교육 연계 창의융합 교육 모델 AX전환",
    items:[mti("i1","AI기반 체험 콘텐츠 확산",3),mti("i2","창의융합 콘텐츠 고도화",2)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T302",goalId:"G3",name:"에코-스마트 융합 교육 모델 정립",
    items:[mti("i1","환경 융합 프로그램 개발",4),mti("i2","공모사업 선정",1)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T303",goalId:"G3",name:"생애주기별 통합학습 기반 수익구조 극대화",
    items:[mti("i1","평생학습 신규강좌 발굴",3),mti("i2","평생교육·생활체육 반 증설",7)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T401",goalId:"G4",name:"미래대비 조직역량체계 확립",
    items:[mti("i1","전략·리더십 교육 커리큘럼 개발",1),mti("i2","AI 스마트 솔루션 도입",1)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T402",goalId:"G4",name:"현장체감형 경영지원 서비스 혁신",
    items:[mti("i1","현안 해결 사례 발굴",2),mti("i2","신규 서비스 개발·제안",2)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T403",goalId:"G4",name:"지속가능한 운영지원 서비스 표준화",
    items:[mti("i1","서비스 표준화 운영계획 수립",1),mti("i2","업무 프로세스 가이드라인 수립·배포",5)],
    checked:{},records:{},schedules:{},note:""},
  {id:"T404",goalId:"G4",name:"상생하는 지역사회 플랫폼 구축",
    items:[mti("i1","대외협력 중장기 로드맵 수립",1),mti("i2","대외협력 매뉴얼 구축",1),mti("i3","지역 상생 사회공헌 프로그램 기획·운영",1)],
    checked:{},records:{},schedules:{},note:""},
];

/* ══════════════════════════════════════
   유틸
══════════════════════════════════════ */
const STATUS_C = {"달성":"#22c55e","진행중":"#f59e0b","위험":"#ef4444","미시작":"#6b7280","미기재":"#475569"};
const TASK_C   = {"달성":"#22c55e","진행중":"#f59e0b","미시작":"#6b7280"};
const MONTHS   = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const getP = k => (!k.target || k.current === null || k.current === undefined)
  ? null : Math.min(100, Math.round((k.current / k.target) * 100));
const getS = p => p === null ? "미기재" : p >= 100 ? "달성" : p >= 70 ? "진행중" : p >= 30 ? "위험" : "미시작";
const pCol = p => p === null ? "#475569" : p >= 100 ? "#22c55e" : p >= 70 ? "#6366f1" : p >= 30 ? "#f59e0b" : "#ef4444";
const fmt  = (n, u) => {
  if (n === null || n === undefined) return "-";
  if (u === "천원") return n.toLocaleString();
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "만";
  return n.toLocaleString();
};

/* ══════════════════════════════════════
   공통 컴포넌트
══════════════════════════════════════ */
function PBar({ pct, color }) {
  return (
    <div style={{background:"#1a2540",borderRadius:99,height:7,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${pct||0}%`,background:color,borderRadius:99,transition:"width 0.5s"}}/>
    </div>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:16,width:"min(95vw,500px)",maxHeight:"90vh",overflowY:"auto",padding:26,position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#6b7280",cursor:"pointer"}}><X size={18}/></button>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   자체계량 실적 입력 모달
══════════════════════════════════════ */
function UpdateModal({ kpi, onSave, onClose }) {
  const [val, setVal]     = useState(kpi.current ?? "");
  const [recs, setRecs]   = useState(kpi.records || []);
  const [adding, setAdding] = useState(false);
  const [nt, setNt] = useState(""); const [nd, setNd] = useState("");

  const addR = () => {
    if (!nt.trim()) return;
    setRecs(r => [...r, {id:Date.now(), title:nt, date:nd}]);
    setNt(""); setNd(""); setAdding(false);
  };

  return (
    <div>
      <h2 style={{color:"#f1f5f9",fontSize:17,fontWeight:700,marginBottom:4}}>실적 입력</h2>
      <p style={{color:"#94a3b8",fontSize:13,marginBottom:18}}>{kpi.name}</p>

      <label style={{color:"#94a3b8",fontSize:12,display:"block",marginBottom:5}}>
        현재 수치 ({kpi.unit}) · 목표: {fmt(kpi.target,kpi.unit)}{kpi.unit}
        {kpi.prev != null ? ` · 25년: ${fmt(kpi.prev,kpi.unit)}${kpi.unit}` : ""}
      </label>
      <input type="number" step="any" value={val} onChange={e => setVal(e.target.value)}
        style={{width:"100%",background:"#1a2540",border:"1px solid #1e2d45",borderRadius:8,padding:"10px 12px",color:"#f1f5f9",fontSize:16,outline:"none",boxSizing:"border-box"}}/>
      {val !== "" && kpi.target &&
        <p style={{color:pCol(Math.min(100,Math.round((Number(val)/kpi.target)*100))),fontSize:12,margin:"5px 0 0",fontWeight:600}}>
          달성률 {Math.min(100,Math.round((Number(val)/kpi.target)*100))}%
        </p>}

      <div style={{borderTop:"1px solid #1e2d45",paddingTop:14,marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{color:"#94a3b8",fontSize:12,fontWeight:700}}>세부 실적 내역 <span style={{color:"#64748b",fontWeight:400}}>({recs.length}건)</span></span>
          <button onClick={() => setAdding(true)}
            style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:6,color:"#fff",padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>+ 추가</button>
        </div>
        {adding && (
          <div style={{background:"#1a2540",borderRadius:10,padding:12,marginBottom:10,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",gap:8}}>
              <input type="date" value={nd} onChange={e => setNd(e.target.value)}
                style={{width:130,background:"#0f1623",border:"1px solid #1e2d45",borderRadius:6,padding:"7px 8px",color:"#f1f5f9",fontSize:12,outline:"none"}}/>
              <input placeholder="실적명 (필수)" value={nt} onChange={e => setNt(e.target.value)}
                style={{flex:1,background:"#0f1623",border:"1px solid #1e2d45",borderRadius:6,padding:"7px 8px",color:"#f1f5f9",fontSize:12,outline:"none"}}/>
            </div>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
              <button onClick={() => setAdding(false)} style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:6,color:"#94a3b8",padding:"6px 12px",cursor:"pointer",fontSize:12}}>취소</button>
              <button onClick={addR} style={{background:"#22c55e",border:"none",borderRadius:6,color:"#fff",padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>저장</button>
            </div>
          </div>
        )}
        {recs.length === 0
          ? <p style={{color:"#475569",fontSize:12,textAlign:"center",padding:"14px 0"}}>입력된 세부 실적이 없어요</p>
          : <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
              {recs.map((r,i) => (
                <div key={r.id} style={{background:"#1a2540",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{color:"#6366f1",fontWeight:700,fontSize:12,minWidth:20}}>{i+1}</span>
                  <span style={{color:"#f1f5f9",fontSize:13,flex:1}}>{r.title}</span>
                  {r.date && <span style={{color:"#64748b",fontSize:11}}>{r.date}</span>}
                  <button onClick={() => setRecs(rs => rs.filter(x => x.id !== r.id))}
                    style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",padding:2}}><Trash2 size={13}/></button>
                </div>
              ))}
            </div>}
      </div>

      <div style={{display:"flex",gap:10,marginTop:16,borderTop:"1px solid #1e2d45",paddingTop:14}}>
        <button onClick={onClose} style={{flex:1,padding:11,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:8,color:"#94a3b8",cursor:"pointer"}}>취소</button>
        <button onClick={() => onSave(kpi.id, val === "" ? null : Number(val), recs)}
          style={{flex:1,padding:11,background:"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:600}}>저장</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   자체계량 KPI 카드
══════════════════════════════════════ */
function KPICard({ kpi, goalColor, onUpdate, onEdit, onDelete, onSchedule }) {
  const p = getP(kpi), s = getS(p), c = pCol(p);
  const [es, setEs] = useState(false);
  const [sv, setSv] = useState(kpi.scheduledAt || "");

  return (
    <div style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:14,padding:18,display:"flex",flexDirection:"column",gap:10,transition:"transform 0.15s,box-shadow 0.15s"}}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${goalColor}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <p style={{color:"#cbd5e1",fontSize:12,margin:"0 0 4px",fontWeight:600}}>{kpi.name}</p>
          {kpi.criterion && <p style={{color:"#94a3b8",fontSize:11,margin:0}}>{kpi.criterion}</p>}
        </div>
        <div style={{display:"flex",gap:4,marginLeft:6}}>
          <button onClick={() => onUpdate(kpi)} style={{background:"none",border:"none",color:"#8b9ab0",cursor:"pointer",padding:3}}><TrendingUp size={13}/></button>
          <button onClick={() => onEdit(kpi)}   style={{background:"none",border:"none",color:"#8b9ab0",cursor:"pointer",padding:3}}><Edit3 size={13}/></button>
          <button onClick={() => onDelete(kpi.id)} style={{background:"none",border:"none",color:"#8b9ab0",cursor:"pointer",padding:3}}><Trash2 size={13}/></button>
        </div>
      </div>

      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
          {p === null
            ? <span style={{color:"#64748b",fontSize:14,fontWeight:700}}>실적 미입력</span>
            : <span style={{color:"#f1f5f9",fontSize:19,fontWeight:800}}>{fmt(kpi.current,kpi.unit)}<span style={{color:"#8b9ab0",fontSize:11,marginLeft:2}}>{kpi.unit}</span></span>}
          <span style={{color:"#94a3b8",fontSize:12}}>목표 {fmt(kpi.target,kpi.unit)}{kpi.unit}</span>
        </div>
        <PBar pct={p} color={c}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{color:STATUS_C[s],fontSize:11,fontWeight:600}}>● {s}</span>
          <span style={{color:"#94a3b8",fontSize:11}}>{p === null ? "-" : `${p}%`}</span>
        </div>
      </div>

      {kpi.prev !== null && kpi.prev !== undefined &&
        <p style={{color:"#64748b",fontSize:11,margin:0,borderTop:"1px solid #1e2d45",paddingTop:7}}>
          25년 실적: <span style={{color:"#94a3b8"}}>{fmt(kpi.prev,kpi.unit)}{kpi.unit}</span>
        </p>}

      {kpi.records && kpi.records.length > 0 &&
        <div style={{borderTop:"1px solid #1e2d45",paddingTop:8}}>
          <span style={{color:"#6366f1",fontSize:11,fontWeight:700}}>세부 실적 {kpi.records.length}건</span>
          {kpi.records.slice(-2).map((r,i) => (
            <div key={r.id} style={{display:"flex",gap:6,marginTop:3}}>
              <span style={{color:"#6366f1",fontSize:10,fontWeight:700,minWidth:16}}>{kpi.records.indexOf(r)+1}</span>
              <span style={{color:"#94a3b8",fontSize:11,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</span>
              {r.date && <span style={{color:"#64748b",fontSize:10}}>{r.date}</span>}
            </div>
          ))}
        </div>}

      {p === null &&
        <div style={{borderTop:"1px solid #1e2d45",paddingTop:8}}>
          {es
            ? <div style={{display:"flex",gap:5}}>
                <input type="date" value={sv} onChange={e => setSv(e.target.value)}
                  style={{flex:1,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:6,padding:"5px 8px",color:"#f1f5f9",fontSize:11,outline:"none"}}/>
                <button onClick={() => { onSchedule(kpi.id, sv); setEs(false); }}
                  style={{background:"#6366f1",border:"none",borderRadius:6,color:"#fff",padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>저장</button>
                <button onClick={() => setEs(false)}
                  style={{background:"#1a2540",border:"1px solid #1e2d45",borderRadius:6,color:"#94a3b8",padding:"5px 7px",cursor:"pointer",fontSize:11}}>✕</button>
              </div>
            : <button onClick={() => setEs(true)}
                style={{background:"none",border:"1px dashed #1e2d45",borderRadius:6,color:kpi.scheduledAt?"#6366f1":"#64748b",padding:"5px 10px",cursor:"pointer",fontSize:11,width:"100%",textAlign:"left"}}>
                {kpi.scheduledAt ? `📅 입력 예정: ${kpi.scheduledAt}` : "+ 실적 입력 예정일 설정"}
              </button>}
        </div>}
    </div>
  );
}

/* ══════════════════════════════════════
   중점계량 카드 + 월별 실적 모달
══════════════════════════════════════ */
function HQLogModal({ kpi, catColor, onSave, onClose }) {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getMonth()+1}월`);
  const [value, setValue] = useState("");
  const [date,  setDate]  = useState(now.toISOString().slice(0,10));
  const [note,  setNote]  = useState("");

  return (
    <div style={{position:"fixed",inset:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:16,width:"min(94vw,420px)",padding:26,position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#6b7280",cursor:"pointer"}}><X size={18}/></button>
        <span style={{background:catColor+"22",color:catColor,fontSize:11,padding:"3px 9px",borderRadius:10,fontWeight:700}}>중점계량지표</span>
        <h2 style={{color:"#f1f5f9",fontSize:15,fontWeight:700,margin:"10px 0 18px",lineHeight:1.4}}>{kpi.name}</h2>

        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <div style={{flex:1}}>
            <label style={{color:"#94a3b8",fontSize:12,display:"block",marginBottom:5}}>기준 월</label>
            <select value={month} onChange={e => setMonth(e.target.value)}
              style={{width:"100%",background:"#1a2540",border:"1px solid #1e2d45",borderRadius:7,padding:"8px 10px",color:"#f1f5f9",fontSize:13,outline:"none"}}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={{color:"#94a3b8",fontSize:12,display:"block",marginBottom:5}}>작성 기준일</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{width:"100%",background:"#1a2540",border:"1px solid #1e2d45",borderRadius:7,padding:"8px 10px",color:"#f1f5f9",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
        </div>

        <label style={{color:"#94a3b8",fontSize:12,display:"block",marginBottom:5}}>
          실적 ({kpi.unit}) · 목표: {fmt(kpi.target,kpi.unit)}{kpi.unit}
        </label>
        <input type="number" step="any" value={value} onChange={e => setValue(e.target.value)} placeholder="수치 입력"
          style={{width:"100%",background:"#1a2540",border:"1px solid #1e2d45",borderRadius:7,padding:"10px 12px",color:"#f1f5f9",fontSize:16,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
        {value !== "" && kpi.target &&
          <p style={{color:pCol(Math.min(100,Math.round((Number(value)/kpi.target)*100))),fontSize:12,margin:"0 0 12px",fontWeight:600}}>
            달성률 {Math.min(100,Math.round((Number(value)/kpi.target)*100))}%
          </p>}

        <label style={{color:"#94a3b8",fontSize:12,display:"block",marginBottom:5}}>메모 (선택)</label>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="특이사항, 사유 등"
          style={{width:"100%",background:"#1a2540",border:"1px solid #1e2d45",borderRadius:7,padding:"8px 12px",color:"#f1f5f9",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:16}}/>

        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:11,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:8,color:"#94a3b8",cursor:"pointer"}}>취소</button>
          <button onClick={() => { if (!value.trim()) return; onSave({id:Date.now(),month,date,value:Number(value),note}); }}
            style={{flex:1,padding:11,background:"linear-gradient(135deg,#f97316,#ef4444)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:700}}>저장</button>
        </div>
      </div>
    </div>
  );
}

function HQCard({ kpi, catColor, onUpdate }) {
  const logs     = kpi.monthlyLogs || [];
  const latest   = logs.length > 0 ? logs[logs.length-1] : null;
  const current  = latest ? latest.value : null;
  const fakekpi  = {...kpi, current};
  const p = getP(fakekpi), s = getS(p), c = pCol(p);
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:14,padding:18,display:"flex",flexDirection:"column",gap:10,transition:"transform 0.15s,box-shadow 0.15s"}}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${catColor}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{background:catColor+"22",color:catColor,fontSize:10,padding:"2px 7px",borderRadius:10,fontWeight:700}}>{kpi.bsc}</span>
            <span style={{color:"#64748b",fontSize:10}}>가중치 {kpi.weight}점</span>
          </div>
          <p style={{color:"#cbd5e1",fontSize:13,fontWeight:700,margin:0,lineHeight:1.4}}>{kpi.name}</p>
        </div>
        <button onClick={() => setOpen(true)}
          style={{background:"linear-gradient(135deg,#f97316,#ef4444)",border:"none",borderRadius:7,color:"#fff",padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600,flexShrink:0}}>
          + 실적
        </button>
      </div>

      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
          {current === null
            ? <span style={{color:"#64748b",fontSize:14,fontWeight:700}}>실적 미입력</span>
            : <span style={{color:"#f1f5f9",fontSize:19,fontWeight:800}}>{fmt(current,kpi.unit)}<span style={{color:"#8b9ab0",fontSize:11,marginLeft:2}}>{kpi.unit}</span></span>}
          <span style={{color:"#94a3b8",fontSize:12}}>목표 {fmt(kpi.target,kpi.unit)}{kpi.unit}</span>
        </div>
        <PBar pct={p} color={c}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{color:STATUS_C[s],fontSize:11,fontWeight:600}}>● {s}</span>
          <span style={{color:"#94a3b8",fontSize:11}}>{p === null ? "-" : `${p}%`}</span>
        </div>
      </div>

      <div style={{borderTop:"1px solid #1e2d45",paddingTop:8,display:"flex",flexDirection:"column",gap:3}}>
        <p style={{color:"#64748b",fontSize:11,margin:0}}>📐 {kpi.formula}</p>
        {kpi.criterion   && <p style={{color:"#64748b",fontSize:11,margin:0}}>🎯 {kpi.criterion}</p>}
        {kpi.targetNote  && <p style={{color:"#64748b",fontSize:11,margin:0}}>ℹ️ {kpi.targetNote}</p>}
      </div>

      {logs.length > 0 &&
        <div style={{borderTop:"1px solid #1e2d45",paddingTop:8}}>
          <button onClick={() => setExpanded(v => !v)}
            style={{background:"none",border:"none",color:"#94a3b8",fontSize:11,cursor:"pointer",padding:0,fontWeight:600}}>
            📅 월별 실적 {logs.length}건 {expanded ? "▲" : "▼"}
          </button>
          {expanded &&
            <div style={{marginTop:7,display:"flex",flexDirection:"column",gap:4}}>
              {[...logs].reverse().map(log => (
                <div key={log.id} style={{display:"flex",alignItems:"center",gap:8,background:"#0d1628",borderRadius:7,padding:"7px 10px"}}>
                  <span style={{color:catColor,fontSize:11,fontWeight:700,minWidth:28}}>{log.month}</span>
                  <span style={{color:"#f1f5f9",fontSize:12,fontWeight:600}}>{fmt(log.value,kpi.unit)}{kpi.unit}</span>
                  <span style={{color:"#64748b",fontSize:11,flex:1}}>{log.note}</span>
                  <span style={{color:"#475569",fontSize:10}}>{log.date}</span>
                  <button onClick={() => onUpdate(kpi.id, logs.filter(l => l.id !== log.id))}
                    style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",padding:2}}><Trash2 size={12}/></button>
                </div>
              ))}
            </div>}
        </div>}

      {open && <HQLogModal kpi={kpi} catColor={catColor}
        onSave={log => { onUpdate(kpi.id, [...logs, log]); setOpen(false); }}
        onClose={() => setOpen(false)}/>}
    </div>
  );
}

/* ══════════════════════════════════════
   비계량 카드
══════════════════════════════════════ */
function RecordForm({ onAdd, onCancel }) {
  const [t, setT] = useState(""); const [d, setD] = useState("");
  return (
    <div style={{background:"#0d1628",border:"1px solid #1e2d45",borderRadius:8,padding:10,display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",gap:6}}>
        <input type="date" value={d} onChange={e => setD(e.target.value)}
          style={{width:120,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:6,padding:"5px 8px",color:"#f1f5f9",fontSize:11,outline:"none",flexShrink:0}}/>
        <input placeholder="실적명 (필수)" value={t} onChange={e => setT(e.target.value)}
          onKeyDown={e => e.key === "Enter" && t.trim() && onAdd({title:t, date:d})}
          style={{flex:1,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:6,padding:"5px 8px",color:"#f1f5f9",fontSize:11,outline:"none"}}/>
      </div>
      <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{background:"none",border:"1px solid #1e2d45",borderRadius:5,color:"#94a3b8",padding:"4px 10px",cursor:"pointer",fontSize:11}}>취소</button>
        <button onClick={() => t.trim() && onAdd({title:t, date:d})}
          style={{background:"#6366f1",border:"none",borderRadius:5,color:"#fff",padding:"4px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>추가</button>
      </div>
    </div>
  );
}

function TaskCard({ task, goalColor, onUpdate }) {
  const [editNote, setEditNote] = useState(false);
  const [note, setNote]         = useState(task.note || "");
  const [addFor, setAddFor]     = useState(null);
  const [expanded, setExpanded] = useState({});
  const [schedFor, setSchedFor] = useState(null);
  const [schedV, setSchedV]     = useState("");

  const getDone = item => item.target === 1
    ? (task.checked[item.id] ? 1 : 0)
    : ((task.records || {})[item.id] || []).length;
  const isComplete = item => getDone(item) >= item.target;

  const totalT = task.items.reduce((s,i) => s + i.target, 0);
  const totalD = task.items.reduce((s,i) => s + Math.min(getDone(i), i.target), 0);
  const pct    = totalT > 0 ? Math.round((totalD / totalT) * 100) : 0;
  const autoS  = pct === 100 ? "달성" : pct > 0 ? "진행중" : "미시작";
  const pc     = pct === 100 ? "#22c55e" : pct >= 50 ? "#6366f1" : pct > 0 ? "#f59e0b" : "#334155";

  return (
    <div style={{background:"#0f1623",border:`1px solid ${pct===100?"#22c55e44":"#1e2d45"}`,borderRadius:14,padding:18,display:"flex",flexDirection:"column",gap:10}}
      onMouseEnter={e => e.currentTarget.style.boxShadow=`0 8px 28px ${goalColor}22`}
      onMouseLeave={e => e.currentTarget.style.boxShadow=""}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
        <p style={{color:"#94a3b8",fontSize:13,fontWeight:700,margin:0,flex:1,lineHeight:1.4}}>{task.name}</p>
        <span style={{color:TASK_C[autoS],fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>● {autoS}</span>
      </div>

      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
          <span style={{color:"#94a3b8",fontSize:11}}>완료기준 달성률</span>
          <span style={{color:pc,fontWeight:800,fontSize:17}}>{pct}<span style={{fontSize:12}}>%</span></span>
        </div>
        <PBar pct={pct} color={pc}/>
        <p style={{color:"#94a3b8",fontSize:11,margin:"4px 0 0",textAlign:"right"}}>{totalD}/{totalT} 건 완료</p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {task.items.map(item => {
          const done = getDone(item); const comp = isComplete(item);
          const recs = (task.records || {})[item.id] || [];
          const sched = (task.schedules || {})[item.id];
          return (
            <div key={item.id} style={{background:comp?"#0d2818":"#0d1220",border:`1px solid ${comp?"#22c55e33":"#1e2d45"}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px"}}>
                {item.target === 1
                  ? <button onClick={() => { const nc={...task.checked,[item.id]:!task.checked[item.id]}; onUpdate(task.id,{checked:nc}); }}
                      style={{width:20,height:20,borderRadius:5,border:`2px solid ${comp?"#22c55e":"#334155"}`,background:comp?"#22c55e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",padding:0}}>
                      {comp && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                  : <div style={{flexShrink:0,minWidth:36,textAlign:"center"}}>
                      <span style={{color:comp?"#22c55e":done>0?"#f59e0b":"#64748b",fontWeight:800,fontSize:13}}>{done}</span>
                      <span style={{color:"#64748b",fontSize:11}}>/{item.target}</span>
                    </div>}
                <span style={{flex:1,color:comp?"#4ade80":"#94a3b8",fontSize:12,lineHeight:1.4}}>{item.label}{item.target>1?` (${item.target}건)`:""}</span>
                <div style={{display:"flex",gap:4}}>
                  {item.target > 1 && !comp &&
                    <button onClick={() => setAddFor(addFor===item.id ? null : item.id)}
                      style={{background:"#6366f122",border:"1px solid #6366f144",borderRadius:5,color:"#818cf8",padding:"3px 8px",cursor:"pointer",fontSize:11,fontWeight:600}}>+ 추가</button>}
                  {item.target > 1 && recs.length > 0 &&
                    <button onClick={() => setExpanded(p => ({...p,[item.id]:!p[item.id]}))}
                      style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:11,padding:"3px 4px"}}>
                      {expanded[item.id] ? "▲" : `▼ ${recs.length}건`}
                    </button>}
                </div>
              </div>

              {addFor === item.id &&
                <div style={{padding:"0 12px 10px"}}>
                  <RecordForm
                    onAdd={rec => {
                      const er = (task.records||{})[item.id] || [];
                      onUpdate(task.id, {records:{...(task.records||{}),[item.id]:[...er,{id:Date.now(),...rec}]}});
                      setAddFor(null);
                    }}
                    onCancel={() => setAddFor(null)}/>
                </div>}

              {item.target > 1 && expanded[item.id] && recs.length > 0 &&
                <div style={{borderTop:"1px solid #1e2d45",padding:"7px 12px",display:"flex",flexDirection:"column",gap:4}}>
                  {recs.map((r,idx) => (
                    <div key={r.id} style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:"#6366f1",fontWeight:700,fontSize:11,minWidth:18}}>{idx+1}</span>
                      <span style={{color:"#cbd5e1",fontSize:12,flex:1}}>{r.title}</span>
                      {r.date && <span style={{color:"#64748b",fontSize:11}}>{r.date}</span>}
                      <button onClick={() => {
                          const er = recs.filter(x => x.id !== r.id);
                          onUpdate(task.id, {records:{...(task.records||{}),[item.id]:er}});
                        }}
                        style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",padding:2}}><Trash2 size={12}/></button>
                    </div>
                  ))}
                </div>}

              {!comp &&
                <div style={{padding:"0 12px 8px"}}>
                  {schedFor === item.id
                    ? <div style={{display:"flex",gap:5,alignItems:"center",paddingTop:5}}>
                        <input type="date" value={schedV} onChange={e => setSchedV(e.target.value)}
                          style={{flex:1,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:5,padding:"4px 8px",color:"#f1f5f9",fontSize:11,outline:"none"}}/>
                        <button onClick={() => { onUpdate(task.id,{schedules:{...(task.schedules||{}),[item.id]:schedV}}); setSchedFor(null); }}
                          style={{background:"#6366f1",border:"none",borderRadius:5,color:"#fff",padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>저장</button>
                        <button onClick={() => setSchedFor(null)}
                          style={{background:"none",border:"1px solid #1e2d45",borderRadius:5,color:"#94a3b8",padding:"4px 7px",cursor:"pointer",fontSize:11}}>✕</button>
                      </div>
                    : <button onClick={() => { setSchedV((task.schedules||{})[item.id]||""); setSchedFor(item.id); }}
                        style={{background:"none",border:"none",cursor:"pointer",textAlign:"left",color:sched?"#6366f1":"#374151",fontSize:11,paddingTop:4}}>
                        {sched ? `📅 완료 예정: ${sched}` : "+ 완료 예정일 설정"}
                      </button>}
                </div>}
            </div>
          );
        })}
      </div>

      <div style={{borderTop:"1px solid #1e2d45",paddingTop:8}}>
        {editNote
          ? <div style={{display:"flex",gap:6}}>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="진행사항 메모..."
                style={{flex:1,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:6,padding:"7px 10px",color:"#f1f5f9",fontSize:12,outline:"none"}}/>
              <button onClick={() => { onUpdate(task.id,{note}); setEditNote(false); }}
                style={{background:"#6366f1",border:"none",borderRadius:6,color:"#fff",padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>저장</button>
              <button onClick={() => setEditNote(false)}
                style={{background:"#1a2540",border:"1px solid #1e2d45",borderRadius:6,color:"#94a3b8",padding:"7px 10px",cursor:"pointer",fontSize:12}}>취소</button>
            </div>
          : <button onClick={() => setEditNote(true)}
              style={{background:"none",border:"1px dashed #1e2d45",borderRadius:6,color:task.note?"#94a3b8":"#64748b",padding:"7px 12px",cursor:"pointer",fontSize:11,textAlign:"left",width:"100%"}}>
              {task.note ? `📝 ${task.note}` : "+ 진행사항 메모 추가"}
            </button>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
export default function App() {
  const [kpis,    setKpis]    = useState([]);
  const [tasks,   setTasks]   = useState([]);
  const [hqKpis,  setHqKpis]  = useState([]);
  const [loaded,  setLoaded]  = useState(false);
  const [tab,     setTab]     = useState("overview");
  const [fGoal,   setFGoal]   = useState("전체");
  const [modal,   setModal]   = useState(null);
  const [msg,     setMsg]     = useState("");


  const GS_URL = "https://script.google.com/macros/s/AKfycbxNdCkyobK9o5akbQaG1AQC3DvSh8IV1i_tk9Nr3BCUsNG8jcyquKkfev8vJdABebXk/exec";

  const gsGet = async () => {
    const res = await fetch(GS_URL);
    const json = await res.json();
    return json.data;
  };

  
  const gsPost = async (body) => {
    try {
      await fetch(GS_URL, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    } catch(e) { console.error("저장 실패", e); }
  };

  useEffect(() => {
    (async () => {
      try {
        if (GS_URL) {
          const data = await gsGet();
          setKpis(data.selfKpis?.length  ? data.selfKpis  : defaultKPIs);
          setTasks(data.tasks?.length    ? data.tasks      : defaultTasks);
          setHqKpis(data.hqKpis?.length  ? data.hqKpis    : defaultHQKPIs);
        } else {
          setKpis(defaultKPIs); setTasks(defaultTasks); setHqKpis(defaultHQKPIs);
        }
      } catch {
        setKpis(defaultKPIs); setTasks(defaultTasks); setHqKpis(defaultHQKPIs);
      }
      setLoaded(true);
    })();
  }, []);

  const updateKPI = (id, val, recs) => {
    setKpis(ks => {
      const next = ks.map(k => k.id !== id ? k : {
        ...k, current: val, records: recs ?? k.records ?? [],
        scheduledAt: val !== null ? null : k.scheduledAt,
        history: val !== null ? [...(k.history||[]), Math.round(getP({...k,current:val}))].slice(-8) : k.history
      });
      if (GS_URL) gsPost({action:"upsert", sheet:"self_kpi", id, data:next.find(k=>k.id===id), user:"야탑"});
      return next;
    });
    setModal(null);
  };
  const schedKPI = (id, date) => setKpis(ks => {
    const n = ks.map(k => k.id !== id ? k : {...k, scheduledAt:date});
    if (GS_URL) gsPost({action:"upsert", sheet:"self_kpi", id, data:n.find(k=>k.id===id), user:"야탑"});
    return n;
  });
  const editKPI = (form) => {
    setKpis(ks => { const n=ks.map(k=>k.id!==form.id?k:{...k,...form}); if(GS_URL) gsPost({action:"upsert",sheet:"self_kpi",id:form.id,data:form,user:"야탑"}); return n; });
    setModal(null);
  };
  const delKPI    = (id)       => setKpis(ks => ks.filter(k => k.id !== id));
  const updateHQ  = (id, logs) => setHqKpis(ks => {
    const n = ks.map(k => k.id !== id ? k : {...k, monthlyLogs:logs});
    if (GS_URL) gsPost({action:"upsert", sheet:"hq_kpi", id, data:n.find(k=>k.id===id), user:"야탑"});
    return n;
  });
  const updateTask = (id, patch) => setTasks(ts => {
    const n = ts.map(t => t.id !== id ? t : {...t, ...patch});
    if (GS_URL) gsPost({action:"upsert", sheet:"tasks", id, data:n.find(t=>t.id===id), user:"야탑"});
    return n;
  });

  const enteredKPIs = kpis.filter(k => k.current !== null && k.current !== undefined);
  const totalPct    = enteredKPIs.length ? Math.round(enteredKPIs.reduce((s,k)=>s+getP(k),0)/enteredKPIs.length) : 0;
  const goalStats   = GOALS.map(g => {
    const gids = KPI_GROUPS.filter(kg => kg.goalId === g.id).map(kg => kg.id);
    const gk   = kpis.filter(k => gids.includes(k.groupId) && k.current !== null && k.current !== undefined);
    const tot  = kpis.filter(k => gids.includes(k.groupId)).length;
    return {...g, avg: gk.length ? Math.round(gk.reduce((s,k)=>s+getP(k),0)/gk.length) : 0, count:tot, entered:gk.length};
  });
  const taskDone = tasks.filter(t => {
    const tot = t.items.reduce((s,i)=>s+i.target,0);
    const don = t.items.reduce((s,i)=>s+(i.target===1?(t.checked[i.id]?1:0):((t.records||{})[i.id]||[]).length),0);
    return tot > 0 && don >= tot;
  }).length;

  const TABS = [["overview","전체 현황"],["quant","자체계량지표"],["hq","중점계량지표"],["qual","비계량지표"]];

  return (
    <div style={{minHeight:"100vh",background:"#070d18",color:"#f1f5f9",fontFamily:"'Pretendard','Apple SD Gothic Neo',sans-serif",paddingBottom:60}}>

      {/* 헤더 */}
      <div style={{background:"#0a1020",borderBottom:"1px solid #1e2d45",padding:"14px 20px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{width:34,height:34,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Target size={18} color="#fff"/>
        </div>
        <div>
          <h1 style={{margin:0,fontSize:16,fontWeight:800,letterSpacing:"-0.5px"}}>성과지표 관리 대시보드</h1>
          <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>야탑 유스센터 · 2026년 성과지표</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8,background:"#0d1628",border:"1px solid #1e2d45",borderRadius:8,padding:"5px 10px"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e"}}/>
          <span style={{color:"#86efac",fontSize:11,fontWeight:600}}>Google Sheets 연동됨</span>
        </div>
        {[
          {label:"📤 초기 데이터 업로드", action: async () => {
            setMsg("업로드 중...");
            try {
              await gsPost({action:"init", sheet:"self_kpi", data:defaultKPIs,   user:"야탑"});
              await gsPost({action:"init", sheet:"hq_kpi",   data:defaultHQKPIs, user:"야탑"});
              await gsPost({action:"init", sheet:"tasks",    data:defaultTasks,   user:"야탑"});
              const data = await gsGet();
              setKpis(data.selfKpis); setHqKpis(data.hqKpis); setTasks(data.tasks);
              setMsg("✅ 업로드 완료!");
            } catch(e) { setMsg("❌ 실패"); }
            setTimeout(()=>setMsg(""),4000);
          }},
          {label:"🔄 새로고침", action: async () => {
            setMsg("불러오는 중...");
            try {
              const data = await gsGet();
              setKpis(data.selfKpis?.length ? data.selfKpis : defaultKPIs);
              setHqKpis(data.hqKpis?.length ? data.hqKpis : defaultHQKPIs);
              setTasks(data.tasks?.length ? data.tasks : defaultTasks);
              setMsg("✅ 완료!");
            } catch { setMsg("❌ 실패"); }
            setTimeout(()=>setMsg(""),3000);
          }}
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            style={{background:"#1a2540",border:"1px solid #1e2d45",borderRadius:7,color:"#94a3b8",padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>
            {btn.label}
          </button>
        ))}
        {msg && <span style={{color:msg.startsWith("✅")?"#22c55e":msg.startsWith("❌")?"#ef4444":"#f59e0b",fontSize:12,fontWeight:600}}>{msg}</span>}
        <div style={{marginLeft:"auto",display:"flex",gap:4,background:"#0f1623",borderRadius:10,padding:4}}>
          {TABS.map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{padding:"6px 13px",borderRadius:7,border:"none",
                background: tab===t ? (t==="hq" ? "linear-gradient(135deg,#f97316,#ef4444)" : "linear-gradient(135deg,#6366f1,#8b5cf6)") : "none",
                color: tab===t ? "#fff" : "#94a3b8", fontSize:12, fontWeight:600, cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 16px"}}>

        {/* 전체 현황 */}
        {tab === "overview" && <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:20}}>
            {[
              {l:"자체계량 지표",  v:KPI_GROUPS.length, u:"개", c:"#6366f1"},
              {l:"평균 달성률",    v:enteredKPIs.length ? totalPct : "-", u:enteredKPIs.length?"%":"", c:"#22c55e"},
              {l:"실적 미입력",    v:kpis.length-enteredKPIs.length, u:"개", c:"#64748b"},
              {l:"비계량 완료",    v:`${taskDone}/${tasks.length}`, u:"", c:"#f59e0b"},
              {l:"중점계량 입력",  v:`${hqKpis.filter(k=>(k.monthlyLogs||[]).length>0).length}/${hqKpis.length}`, u:"", c:"#f97316"},
            ].map(s => (
              <div key={s.l} style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:12,padding:"16px 18px"}}>
                <p style={{color:"#94a3b8",fontSize:11,margin:"0 0 5px",fontWeight:600}}>{s.l}</p>
                <p style={{color:s.c,fontSize:26,fontWeight:800,margin:0,letterSpacing:"-1px"}}>{s.v}<span style={{fontSize:12,marginLeft:2}}>{s.u}</span></p>
              </div>
            ))}
          </div>

          <div style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:14,padding:22,marginBottom:16}}>
            <h3 style={{color:"#94a3b8",fontSize:13,fontWeight:700,margin:"0 0 18px"}}>성과목표별 달성률</h3>
            {goalStats.map(g => (
              <div key={g.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:9,height:9,borderRadius:"50%",background:g.color,display:"inline-block"}}/>
                    <span style={{color:"#94a3b8",fontSize:13}}>{g.name}</span>
                    <span style={{color:"#64748b",fontSize:11}}>입력 {g.entered}/{g.count}</span>
                  </div>
                  <span style={{color:g.color,fontWeight:700,fontSize:14}}>{g.avg}%</span>
                </div>
                <PBar pct={g.avg} color={g.color}/>
              </div>
            ))}
          </div>

          <div style={{background:"#0f1623",border:"1px solid #1e2d45",borderRadius:14,padding:22}}>
            <h3 style={{color:"#94a3b8",fontSize:13,fontWeight:700,margin:"0 0 14px"}}>성과목표별 달성률 비교</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={goalStats} margin={{left:-10,bottom:16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45"/>
                <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}
                  tickFormatter={n => n.length>10 ? n.slice(0,10)+"…" : n} angle={-8} textAnchor="end"/>
                <YAxis tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]}/>
                <Tooltip contentStyle={{background:"#1a2540",border:"1px solid #1e2d45",borderRadius:8,color:"#f1f5f9"}} formatter={v => [v+"%","달성률"]}/>
                <Bar dataKey="avg" radius={[5,5,0,0]}>
                  {goalStats.map((g,i) => <Cell key={i} fill={g.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>}

        {/* 자체계량지표 */}
        {tab === "quant" && <>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:18}}>
            {["전체", ...GOALS.map(g=>g.id)].map(gid => {
              const g = GOALS.find(g => g.id === gid);
              const act = fGoal === gid;
              return (
                <button key={gid} onClick={() => setFGoal(gid)}
                  style={{padding:"6px 13px",borderRadius:20,border:act?"none":"1px solid #1e2d45",
                    background:act?(g?.color||"#6366f1"):"#0f1623",color:act?"#fff":"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {gid==="전체" ? "전체" : g?.name.slice(0,10)+"…"}
                </button>
              );
            })}
          </div>
          {GOALS.filter(g => fGoal==="전체" || g.id===fGoal).map(goal => {
            const gGroups = KPI_GROUPS.filter(kg => kg.goalId === goal.id);
            return (
              <div key={goal.id} style={{marginBottom:32}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,paddingBottom:10,borderBottom:`2px solid ${goal.color}33`}}>
                  <div style={{width:5,height:20,background:goal.color,borderRadius:99}}/>
                  <h2 style={{color:"#f1f5f9",fontSize:14,fontWeight:800,margin:0}}>{goal.name}</h2>
                  <span style={{color:"#94a3b8",fontSize:12,background:"#1e3a5f",padding:"2px 8px",borderRadius:6,fontWeight:600}}>가중치 {goal.weight}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {gGroups.map(kg => {
                    const gkpis = kpis.filter(k => k.groupId === kg.id);
                    const ent   = gkpis.filter(k => k.current !== null && k.current !== undefined);
                    const gavg  = ent.length ? Math.round(ent.reduce((s,k)=>s+getP(k),0)/ent.length) : null;
                    return (
                      <div key={kg.id} style={{background:"#0a111e",border:"1px solid #1e2d45",borderRadius:13,overflow:"hidden"}}>
                        <div style={{padding:"12px 18px",background:"#0d1628",borderBottom:"1px solid #1e2d45",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <div style={{width:3,height:15,background:goal.color,borderRadius:99}}/>
                            <span style={{color:"#cbd5e1",fontSize:13,fontWeight:700}}>{kg.name}</span>
                            <span style={{color:"#94a3b8",fontSize:11,background:"#1e3a5f",padding:"2px 7px",borderRadius:5,fontWeight:600}}>가중치 {kg.weight}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{color:"#cbd5e1",fontSize:11}}>입력 {ent.length}/{gkpis.length}</span>
                            <span style={{color:pCol(gavg),fontWeight:800,fontSize:14}}>{gavg===null?"-":`${gavg}%`}</span>
                          </div>
                        </div>
                        <div style={{padding:14,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:11}}>
                          {gkpis.map(kpi => (
                            <KPICard key={kpi.id} kpi={kpi} goalColor={goal.color}
                              onUpdate={k => setModal({type:"update",kpi:k})}
                              onEdit={k   => setModal({type:"edit",kpi:k})}
                              onDelete={delKPI}
                              onSchedule={schedKPI}/>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>}

        {/* 중점계량지표 */}
        {tab === "hq" && <>
          <div style={{background:"linear-gradient(135deg,#f9731611,#ef444411)",border:"1px solid #f9731633",borderRadius:12,padding:"13px 18px",marginBottom:22,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <span style={{fontSize:18}}>🏢</span>
            <div>
              <p style={{color:"#fb923c",fontWeight:700,fontSize:13,margin:0}}>본부 공통 중점지표 (야탑)</p>
              <p style={{color:"#94a3b8",fontSize:12,margin:"2px 0 0"}}>총 가중치 {defaultHQKPIs.reduce((s,k)=>s+k.weight,0).toFixed(1)}점</p>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:14}}>
              {[{l:"전체",v:hqKpis.length,c:"#f97316"},{l:"입력완료",v:hqKpis.filter(k=>(k.monthlyLogs||[]).length>0).length,c:"#22c55e"},{l:"미입력",v:hqKpis.filter(k=>(k.monthlyLogs||[]).length===0).length,c:"#64748b"}]
                .map(s => (
                  <div key={s.l} style={{textAlign:"center"}}>
                    <p style={{color:s.c,fontWeight:800,fontSize:20,margin:0}}>{s.v}</p>
                    <p style={{color:"#64748b",fontSize:11,margin:0}}>{s.l}</p>
                  </div>
                ))}
            </div>
          </div>
          {HQ_CATS.map(cat => {
            const ck  = hqKpis.filter(k => k.catId === cat.id);
            const ent = ck.filter(k => (k.monthlyLogs||[]).length > 0);
            const avg = ent.length ? Math.round(ent.reduce((s,k) => {
              const logs = k.monthlyLogs||[]; const latest = logs[logs.length-1];
              return s + getP({...k, current: latest?latest.value:null});
            },0)/ent.length) : null;
            return (
              <div key={cat.id} style={{marginBottom:28}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:10,borderBottom:`2px solid ${cat.color}33`}}>
                  <div style={{width:5,height:20,background:cat.color,borderRadius:99}}/>
                  <h2 style={{color:"#f1f5f9",fontSize:14,fontWeight:800,margin:0}}>{cat.name}</h2>
                  <span style={{color:"#94a3b8",fontSize:12,background:"#1e3a5f",padding:"2px 8px",borderRadius:6,fontWeight:600}}>
                    가중치 합 {ck.reduce((s,k)=>s+k.weight,0).toFixed(1)}점
                  </span>
                  {avg !== null && <span style={{marginLeft:"auto",color:cat.color,fontWeight:800,fontSize:15}}>{avg}%</span>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:13}}>
                  {ck.map(kpi => <HQCard key={kpi.id} kpi={kpi} catColor={cat.color} onUpdate={updateHQ}/>)}
                </div>
              </div>
            );
          })}
        </>}

        {/* 비계량지표 */}
        {tab === "qual" && <>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:18}}>
            {["전체",...GOALS.map(g=>g.id)].map(gid => {
              const g = GOALS.find(g=>g.id===gid); const act = fGoal===gid;
              return (
                <button key={gid} onClick={() => setFGoal(gid)}
                  style={{padding:"6px 13px",borderRadius:20,border:act?"none":"1px solid #1e2d45",
                    background:act?(g?.color||"#6366f1"):"#0f1623",color:act?"#fff":"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {gid==="전체"?"전체":g?.name.slice(0,10)+"…"}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
            {Object.entries(TASK_C).map(([s,c]) => {
              const cnt = tasks.filter(t => {
                const tot=t.items.reduce((sum,i)=>sum+i.target,0);
                const don=t.items.reduce((sum,i)=>sum+(i.target===1?(t.checked[i.id]?1:0):((t.records||{})[i.id]||[]).length),0);
                const auto=tot>0&&don>=tot?"달성":don>0?"진행중":"미시작";
                return auto===s && (fGoal==="전체"||t.goalId===fGoal);
              }).length;
              return (
                <div key={s} style={{background:"#0f1623",border:`1px solid ${c}33`,borderRadius:9,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>
                  <span style={{color:"#94a3b8",fontSize:12}}>{s}</span>
                  <span style={{color:c,fontWeight:700,fontSize:15}}>{cnt}</span>
                </div>
              );
            })}
          </div>
          {GOALS.filter(g => fGoal==="전체"||g.id===fGoal).map(goal => (
            <div key={goal.id} style={{marginBottom:28}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:13}}>
                <div style={{width:4,height:19,background:goal.color,borderRadius:99}}/>
                <h2 style={{color:"#f1f5f9",fontSize:14,fontWeight:700,margin:0}}>{goal.name}</h2>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:13}}>
                {tasks.filter(t=>t.goalId===goal.id).map(task => (
                  <TaskCard key={task.id} task={task} goalColor={goal.color} onUpdate={updateTask}/>
                ))}
              </div>
            </div>
          ))}
        </>}

      </div>

      {/* 모달 */}
      <Modal open={modal?.type==="update"} onClose={() => setModal(null)}>
        {modal?.kpi && <UpdateModal kpi={modal.kpi} onSave={updateKPI} onClose={() => setModal(null)}/>}
      </Modal>
      <Modal open={modal?.type==="edit"} onClose={() => setModal(null)}>
        {modal?.kpi && (
          <div>
            <h2 style={{color:"#f1f5f9",fontSize:17,fontWeight:700,marginBottom:18}}>KPI 편집</h2>
            {[["name","이름","text"],["target","목표 수치","number"],["current","현재 수치","number"],["criterion","평가기준","text"]].map(([k,label,type]) => (
              <div key={k} style={{marginBottom:12}}>
                <label style={{color:"#94a3b8",fontSize:12,display:"block",marginBottom:5}}>{label}</label>
                <input type={type} id={`ef-${k}`} defaultValue={modal.kpi[k]||""}
                  style={{width:"100%",background:"#1a2540",border:"1px solid #1e2d45",borderRadius:8,padding:"9px 12px",color:"#f1f5f9",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <button onClick={() => setModal(null)} style={{flex:1,padding:11,background:"#1a2540",border:"1px solid #1e2d45",borderRadius:8,color:"#94a3b8",cursor:"pointer"}}>취소</button>
              <button onClick={() => {
                  const form = {...modal.kpi};
                  ["name","criterion"].forEach(k => { form[k]=document.getElementById(`ef-${k}`).value; });
                  ["target","current"].forEach(k => { const v=document.getElementById(`ef-${k}`).value; form[k]=v===""?null:Number(v); });
                  editKPI(form);
                }}
                style={{flex:1,padding:11,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:600}}>저장</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
