import { useMemo, useState, useRef, useEffect } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { s } from "../../src/screens/equip.styles";

export const WEAPON_TYPES = [
  { id: "great-sword", label: "大剣" }, { id: "long-sword", label: "太刀" }, { id: "sword-shield", label: "片手剣" },
  { id: "dual-blades", label: "双剣" }, { id: "lance", label: "ランス" }, { id: "gunlance", label: "ガンランス" },
  { id: "hammer", label: "ハンマー" }, { id: "hunting-horn", label: "狩猟笛" }, { id: "switch-axe", label: "スラアク" },
  { id: "charge-blade", label: "チャアク" }, { id: "insect-glaive", label: "操虫棍" }, { id: "bow", label: "弓" },
  { id: "lbg", label: "ライトボウガン" }, { id: "hbg", label: "ヘビィボウガン" },
];

const BLOAT = {
  "great-sword": 4.8, "long-sword": 3.3, "sword-shield": 1.4, "dual-blades": 1.4,
  "hammer": 5.2, "hunting-horn": 4.2, "lance": 2.3, "gunlance": 2.3,
  "switch-axe": 3.5, "charge-blade": 3.6, "insect-glaive": 3.1,
  "bow": 1.2, "lbg": 1.3, "hbg": 1.5,
};

const PART_REQ = {
  "great-sword": ["刃","刃","筒"], "long-sword": ["刃","筒","筒"], "sword-shield": ["刃","筒","盤"],
  "dual-blades": ["刃","刃","盤"], "hammer": ["盤","盤","筒"], "hunting-horn": ["盤","装置","装置"],
  "lance": ["刃","盤","盤"], "gunlance": ["盤","盤","装置"], "switch-axe": ["刃","刃","装置"],
  "charge-blade": ["刃","盤","装置"], "insect-glaive": ["刃","筒","装置"],
  "bow": ["筒","筒","装置"], "lbg": ["筒","装置","装置"], "hbg": ["盤","筒","装置"],
};

const ATTRS = ["無","火","水","雷","氷","龍","毒","麻痺","睡眠","爆破"];

const BASE = { atkTrue: 190, aff: 5 };
const PROD_GAIN = { atk: 5, aff: 5 };
const PROD_ELEM_BONUS = { melee: 30, bow: 30, bowgun: 0 };
const REINF_LIMIT = { atk: 5, aff: 3, elem: 4, sharp: 2, ammo: 2 };
const REINF_GAIN  = { atk: 5, aff: 5, elem: 30, sharp: 30, ammo: 1 };

const isBowgun = (w) => w === "lbg" || w === "hbg";
const isBow   = (w) => w === "bow";
const isMelee = (w) => !(isBowgun(w) || isBow(w));
const allowedReinf = (weapon, elem) => ({ atk: true, aff: true, elem: isBowgun(weapon) ? false : (elem !== "無"), sharp: isMelee(weapon), ammo: isBowgun(weapon) });

const INIT_PART_ATTRS = ["無","無","無"];
const INIT_PROD_KIND  = ["atk","atk","atk"];
const INIT_REINF      = { atk: 0, aff: 0, elem: 0, sharp: 0, ammo: 0 };

// --- web だけ react-dom のポータルを使う（nativeでは未使用）
let createPortal;
try {
  if (Platform.OS === "web") {
    ({ createPortal } = require("react-dom"));
  }
} catch { /* noop */ }

// ===== ポータルメニュー（body直下に固定配置） =====
const PortalMenu = ({ anchorRef, onClose, children, minWidth = 0 }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: minWidth });

  useEffect(() => {
    if (Platform.OS === "web" && anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: Math.max(minWidth, r.width) });
    }
  }, [anchorRef, minWidth]);

  const body = (
    <>
      <Pressable style={[s.backdrop, { zIndex: 50000 }]} onPress={onClose} />
      <View
        style={[
          s.selMenu,
          Platform.select({
            web: { position: "fixed", top: pos.top, left: pos.left, zIndex: 50010, minWidth: pos.width },
            default: { position: "absolute", top: 28, left: 0, zIndex: 50010, minWidth },
          }),
        ]}
      >
        {children}
      </View>
    </>
  );

  if (Platform.OS === "web" && createPortal) return createPortal(body, document.body);
  // native は親の相対配置（必要なら Modal に置換可能）
  return <View style={{ position: "relative" }}>{body}</View>;
};

// ===== 数値ピッカー付きカウンタ（中央タップでプルダウン） =====
const Counter = ({ id, openId, setOpenId, value, onChange, min = 0, max = 99, onReset, onOpen }) => {
  const anchorRef = useRef(null);
  const open = openId === id;
  const numbers = useMemo(() => {
    const len = max - min + 1;
    return len > 0 && len <= 50 ? Array.from({ length: len }, (_, i) => min + i) : null;
  }, [min, max]);

  return (
    <View style={[s.stepRow, { alignItems: "center" }]}>
      <Pressable style={s.stepBtnSm} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={s.stepTxtSm}>-</Text>
      </Pressable>

      <View ref={anchorRef}>
        <Pressable
          style={[s.sel, { height: 26, minWidth: 48, paddingHorizontal: 8 }]}
          onPress={() => { if (numbers) { onOpen?.(); setOpenId(id); } }}
        >
          <Text style={s.selText}>{value}</Text>
        </Pressable>

        {open && numbers && (
          <PortalMenu anchorRef={anchorRef} onClose={() => setOpenId(null)} minWidth={80}>
            {numbers.map(n => (
              <Pressable
                key={n}
                style={[s.selOpt, n === value && s.selOptSel]}
                onPress={() => { onChange(n); setOpenId(null); }}
              >
                <Text style={s.selOptText}>{n}</Text>
              </Pressable>
            ))}
          </PortalMenu>
        )}
      </View>

      <Pressable style={s.stepBtnSm} onPress={() => onChange(Math.min(max, value + 1))}>
        <Text style={s.stepTxtSm}>+</Text>
      </Pressable>

      {onReset && (
        <Pressable style={[s.clearMini, { marginLeft: 6 }]} onPress={onReset}>
          <Text style={s.clearMiniTxt}>↺</Text>
        </Pressable>
      )}
    </View>
  );
};

const Chip = ({ onPress, active, children }) => (
  <Pressable onPress={onPress} style={[s.chip, active && s.chipSel]}>
    <Text style={[s.chipText, active && s.chipTextSel]}>{children}</Text>
  </Pressable>
);

const WeaponSettings = ({ value, onChange }) => {
  const [openId, setOpenId] = useState(null); // カウンタ系の開閉管理
  const [type, setType] = useState(value?.weaponType ?? "long-sword");
  const [mode, setMode] = useState(value?.inputMode ?? "bloated"); // "bloated" / "true"
  const [menuOpen, setMenuOpen] = useState(false);                 // 武器種プルダウン
  const weaponMenuAnchorRef = useRef(null);

  const [atkBaseTrue, setAtkBaseTrue] = useState(value?.atkBaseTrue ?? BASE.atkTrue);

  const req = PART_REQ[type] ?? ["刃","筒","盤"];
  const [partAttrs, setPartAttrs] = useState(value?.partAttrs ?? INIT_PART_ATTRS);
  const [prodKind, setProdKind]   = useState(value?.prodKind   ?? INIT_PROD_KIND);

  const [reinforce, setReinforce] = useState(value?.reinforce ?? INIT_REINF);

  const bloat = BLOAT[type] ?? 1;

  const element = useMemo(() => {
    const cnt = {}; partAttrs.forEach(a => { if (a !== "無") cnt[a] = (cnt[a] || 0) + 1; });
    const hit = Object.entries(cnt).find(([_, c]) => c >= 2);
    return hit ? hit[0] : "無";
  }, [partAttrs]);

  const prodAtk  = useMemo(() => prodKind.filter(k => k === "atk").length * PROD_GAIN.atk, [prodKind]);
  const prodAff  = useMemo(() => prodKind.filter(k => k === "aff").length * PROD_GAIN.aff, [prodKind]);
  const prodElem = useMemo(() => {
    const allSame = partAttrs[0] !== "無" && partAttrs.every(a => a === partAttrs[0]);
    if (!allSame) return 0;
    if (isBowgun(type)) return PROD_ELEM_BONUS.bowgun;
    if (isBow(type))    return PROD_ELEM_BONUS.bow;
    return PROD_ELEM_BONUS.melee;
  }, [partAttrs, type]);

  const totalReinf = reinforce.atk + reinforce.aff + reinforce.elem + reinforce.sharp + reinforce.ammo;
  const allow = allowedReinf(type, element);

  const atkTrue = atkBaseTrue + prodAtk + reinforce.atk * REINF_GAIN.atk;
  const atkDisp = Math.round(atkTrue * bloat);
  const aff     = BASE.aff + prodAff + reinforce.aff * REINF_GAIN.aff;

  const elemFromProd  = (element === "無" || isBowgun(type)) ? 0 : prodElem;
  const elemFromReinf = (element === "無" || isBowgun(type)) ? 0 : reinforce.elem * REINF_GAIN.elem;
  const elemFinal     = elemFromProd + elemFromReinf;

  const sharpAdd = isMelee(type)  ? reinforce.sharp * REINF_GAIN.sharp : 0;
  const ammoAdd  = isBowgun(type) ? reinforce.ammo  * REINF_GAIN.ammo  : 0;

  const commit = (partial) => {
    onChange?.({
      weaponType: type, inputMode: mode, atkBaseTrue,
      partAttrs, prodKind, reinforce,
      ...partial,
      derived: { element, atkTrue, atkDisp, aff, elemFinal, elemFromProd, elemFromReinf, sharpAdd, ammoAdd },
    });
  };

  const attackMain = mode === "bloated" ? atkDisp : atkTrue;
  const attackSubLabel = mode === "bloated" ? "真値" : "表示";
  const attackSubValue = mode === "bloated" ? atkTrue : atkDisp;

  return (
    <View style={{ gap: 12 }}>
      {/* 武器種 */}
      <View style={s.groupBox}>
        <Text style={s.panelHeader}>武器種</Text>

        <View ref={weaponMenuAnchorRef} style={{ position: "relative", marginBottom: 8 }}>
          <Pressable
            style={s.rowThin}
            onPress={() => { setOpenId(null); setMenuOpen(true); }}
          >
            <Text style={s.rowThinText}>武器種：{WEAPON_TYPES.find(x => x.id === type)?.label ?? type}</Text>
          </Pressable>

          {menuOpen && (
            <PortalMenu anchorRef={weaponMenuAnchorRef} onClose={() => setMenuOpen(false)} minWidth={180}>
              {WEAPON_TYPES.map(w => (
                <Pressable
                  key={w.id}
                  style={[s.selOpt, w.id === type && s.selOptSel]}
                  onPress={() => {
                    setType(w.id); setMenuOpen(false);
                    setReinforce(INIT_REINF);
                    commit({ weaponType: w.id, reinforce: INIT_REINF });
                  }}
                >
                  <Text style={s.selOptText}>{w.label}</Text>
                </Pressable>
              ))}
            </PortalMenu>
          )}
        </View>

        {/* 表示攻撃 ↔ 真値 */}
        <View style={s.tableRow}>
          <Pressable style={[s.stepBtnSm, mode === "bloated" && s.selOptSel]} onPress={() => { setMode("bloated"); commit({ inputMode: "bloated" }); }}>
            <Text style={s.stepTxtSm}>表示攻撃</Text>
          </Pressable>
          <Pressable style={[s.stepBtnSm, mode === "true" && s.selOptSel]} onPress={() => { setMode("true"); commit({ inputMode: "true" }); }}>
            <Text style={s.stepTxtSm}>真値</Text>
          </Pressable>
        </View>

        {/* 攻撃ベース */}
        <View style={[s.tableRow, { marginTop: 8 }]}>
          <View style={s.cell}>
            <Text>{mode === "bloated" ? "表示攻撃" : "真値"}（ベース）</Text>
            <Counter
              id="atk-base"
              openId={openId}
              setOpenId={setOpenId}
              onOpen={() => setMenuOpen(false)}  // 別のプルダウンを閉じる
              value={mode === "bloated" ? Math.round(atkBaseTrue * bloat) : Math.round(atkBaseTrue)}
              onChange={(v) => {
                const nextTrue = mode === "bloated" ? Math.max(1, Math.round(v / bloat)) : v;
                setAtkBaseTrue(nextTrue);
                commit({ atkBaseTrue: nextTrue });
              }}
              min={1}
              max={500}
              onReset={() => { setAtkBaseTrue(BASE.atkTrue); commit({ atkBaseTrue: BASE.atkTrue }); }}
            />
            <Text style={s.hint}>現在：表示 {atkDisp} / 真値 {atkTrue}</Text>
          </View>
        </View>
      </View>

      {/* パーツ＆生産ボーナス */}
      <View style={s.groupBox}>
        <Text style={s.panelHeader}>パーツ（{req.join(" / ")}）と生産ボーナス</Text>

        {req.map((p, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={s.kvKey}>{`パーツ${i + 1}：${p}`}</Text>

            <View style={[s.tagsWrap, { marginTop: 6 }]}>
              {ATTRS.map(a => (
                <Chip
                  key={a}
                  active={partAttrs[i] === a}
                  onPress={() => {
                    setMenuOpen(false); setOpenId(null);
                    const next = [...partAttrs]; next[i] = a; setPartAttrs(next);
                    commit({ partAttrs: next });
                  }}
                >
                  {a}
                </Chip>
              ))}
            </View>

            <View style={[s.tagsWrap, { marginTop: 6 }]}>
              <Chip
                active={prodKind[i] === "atk"}
                onPress={() => {
                  setMenuOpen(false); setOpenId(null);
                  const next = [...prodKind]; next[i] = "atk"; setProdKind(next);
                  commit({ prodKind: next });
                }}
              >攻撃</Chip>
              <Chip
                active={prodKind[i] === "aff"}
                onPress={() => {
                  setMenuOpen(false); setOpenId(null);
                  const next = [...prodKind]; next[i] = "aff"; setProdKind(next);
                  commit({ prodKind: next });
                }}
              >会心</Chip>
            </View>
          </View>
        ))}

        <Text style={s.hint}>・同属性×2以上で属性付与（現在: {element}）。同属性×3で属性増強（武器差あり）。</Text>
      </View>

      {/* 復元強化 */}
      <View style={s.groupBox}>
        <Text style={s.panelHeader}>復元強化（残り {5 - totalReinf} / 5）</Text>

        <View style={s.tableRow}>
          <View style={s.cell}>
            <Text>攻撃 +{REINF_GAIN.atk}（最大{REINF_LIMIT.atk}）</Text>
            <Counter
              id="reinf-atk"
              openId={openId}
              setOpenId={setOpenId}
              onOpen={() => setMenuOpen(false)}
              value={reinforce.atk}
              onChange={(v) => {
                const next = Math.min(REINF_LIMIT.atk, Math.max(0, v));
                const tmp = { ...reinforce, atk: next };
                const sum = tmp.atk + tmp.aff + tmp.elem + tmp.sharp + tmp.ammo;
                if (sum <= 5) { setReinforce(tmp); commit({ reinforce: tmp }); }
              }}
              min={0}
              max={REINF_LIMIT.atk}
              onReset={() => { const tmp = { ...reinforce, atk: 0 }; setReinforce(tmp); commit({ reinforce: tmp }); }}
            />
          </View>

          <View style={s.cell}>
            <Text>会心 +{REINF_GAIN.aff}%（最大{REINF_LIMIT.aff}）</Text>
            <Counter
              id="reinf-aff"
              openId={openId}
              setOpenId={setOpenId}
              onOpen={() => setMenuOpen(false)}
              value={reinforce.aff}
              onChange={(v) => {
                const next = Math.min(REINF_LIMIT.aff, Math.max(0, v));
                const tmp = { ...reinforce, aff: next };
                const sum = tmp.atk + tmp.aff + tmp.elem + tmp.sharp + tmp.ammo;
                if (sum <= 5) { setReinforce(tmp); commit({ reinforce: tmp }); }
              }}
              min={0}
              max={REINF_LIMIT.aff}
              onReset={() => { const tmp = { ...reinforce, aff: 0 }; setReinforce(tmp); commit({ reinforce: tmp }); }}
            />
          </View>
        </View>

        <View style={s.tableRow}>
          <View style={[s.cell, !allow.elem && { opacity: 0.4 }]}>
            <Text>属性 +{REINF_GAIN.elem}（最大{REINF_LIMIT.elem}）</Text>
            <Counter
              id="reinf-elem"
              openId={openId}
              setOpenId={setOpenId}
              onOpen={() => setMenuOpen(false)}
              value={reinforce.elem}
              onChange={(v) => {
                if (!allow.elem) return;
                const next = Math.min(REINF_LIMIT.elem, Math.max(0, v));
                const tmp = { ...reinforce, elem: next };
                const sum = tmp.atk + tmp.aff + tmp.elem + tmp.sharp + tmp.ammo;
                if (sum <= 5) { setReinforce(tmp); commit({ reinforce: tmp }); }
              }}
              min={0}
              max={REINF_LIMIT.elem}
              onReset={() => { if (!allow.elem) return; const tmp = { ...reinforce, elem: 0 }; setReinforce(tmp); commit({ reinforce: tmp }); }}
            />
          </View>

          <View style={[s.cell, !allow.sharp && { opacity: 0.4 }]}>
            <Text>斬れ味 +{REINF_GAIN.sharp}（最大{REINF_LIMIT.sharp}/近接）</Text>
            <Counter
              id="reinf-sharp"
              openId={openId}
              setOpenId={setOpenId}
              onOpen={() => setMenuOpen(false)}
              value={reinforce.sharp}
              onChange={(v) => {
                if (!allow.sharp) return;
                const next = Math.min(REINF_LIMIT.sharp, Math.max(0, v));
                const tmp = { ...reinforce, sharp: next };
                const sum = tmp.atk + tmp.aff + tmp.elem + tmp.sharp + tmp.ammo;
                if (sum <= 5) { setReinforce(tmp); commit({ reinforce: tmp }); }
              }}
              min={0}
              max={REINF_LIMIT.sharp}
              onReset={() => { if (!allow.sharp) return; const tmp = { ...reinforce, sharp: 0 }; setReinforce(tmp); commit({ reinforce: tmp }); }}
            />
          </View>

          <View style={[s.cell, !allow.ammo && { opacity: 0.4 }]}>
            <Text>装填数 +{REINF_GAIN.ammo}（最大{REINF_LIMIT.ammo}/ボウガン）</Text>
            <Counter
              id="reinf-ammo"
              openId={openId}
              setOpenId={setOpenId}
              onOpen={() => setMenuOpen(false)}
              value={reinforce.ammo}
              onChange={(v) => {
                if (!allow.ammo) return;
                const next = Math.min(REINF_LIMIT.ammo, Math.max(0, v));
                const tmp = { ...reinforce, ammo: next };
                const sum = tmp.atk + tmp.aff + tmp.elem + tmp.sharp + tmp.ammo;
                if (sum <= 5) { setReinforce(tmp); commit({ reinforce: tmp }); }
              }}
              min={0}
              max={REINF_LIMIT.ammo}
              onReset={() => { if (!allow.ammo) return; const tmp = { ...reinforce, ammo: 0 }; setReinforce(tmp); commit({ reinforce: tmp }); }}
            />
          </View>
        </View>
      </View>

      {/* 概算サマリ */}
      <View style={s.groupBox}>
        <Text style={s.panelHeader}>概算ステータス（R8基準）</Text>
        <View style={s.kvRow}><Text style={s.kvKey}>攻撃（{mode === "bloated" ? "表示" : "真値"}）</Text><Text style={s.kvVal}>{attackMain}</Text></View>
        <Text style={s.hint}>もう一方：{attackSubLabel} {attackSubValue}</Text>
        <View style={s.kvRow}><Text style={s.kvKey}>会心</Text><Text style={s.kvVal}>{aff}%</Text></View>
        <View style={s.kvRow}><Text style={s.kvKey}>属性（種類 / 最終値）</Text><Text style={s.kvVal}>{element === "無" ? "─" : `${element} / +${elemFinal}`}</Text></View>
        {element !== "無" && <View style={s.kvRow}><Text style={s.kvKey}>　内訳</Text><Text style={s.kvVal}>{`生産 +${elemFromProd} ／ 復元 +${elemFromReinf}`}</Text></View>}
        {isMelee(type)  && <View style={s.kvRow}><Text style={s.kvKey}>斬れ味 追加</Text><Text style={s.kvVal}>+{sharpAdd}</Text></View>}
        {isBowgun(type) && <View style={s.kvRow}><Text style={s.kvKey}>装填数 追加</Text><Text style={s.kvVal}>+{ammoAdd}</Text></View>}
      </View>
    </View>
  );
};

export default WeaponSettings;
