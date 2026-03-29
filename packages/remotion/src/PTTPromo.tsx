import React, {CSSProperties, useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BrowserFrame, FloatingBrowser} from './BrowserFrame';
import {arrowTipOffsetPx, CURSOR_ARROW_PATH_D} from './cursorTipOffset';

type PTTPromoProps = {
	brandName?: string;
	tagline?: string;
};

const HERO_DURATION = 120;
const SHOWCASE_DURATION = 120;
const FEATURE_DURATION = 120;
const CTA_DURATION = 150;
const TRANSITION_1 = 30;
const TRANSITION_2 = 15;
const TRANSITION_3 = 20;

const TOTAL_DURATION =
	HERO_DURATION +
	SHOWCASE_DURATION +
	FEATURE_DURATION +
	CTA_DURATION -
	TRANSITION_1 -
	TRANSITION_2 -
	TRANSITION_3;

const COLORS = {
	cream: '#fdfbf0',
	gold: '#d3c25c',
	gold2: '#ead766',
	olive: '#b0a24d',
	ink: '#33280e',
	accent: '#6b7c3d',
	paper: '#faf5d9',
	rose: '#eac6c0',
	cta: '#6b7c3d',
	white: '#fffdf7',
};

const HERO_WORDS = ['PTT', 'makes', 'translation', 'feel', 'effortless'];
const CTA_WORDS = ['Go', 'global', 'with', 'PTT'];

const safeWords = (text = '') => (text ?? '').split(' ').filter(Boolean);

const ParticleField: React.FC<{
	count?: number;
	color?: string;
	opacity?: number;
	speed?: number;
	spread?: number;
}> = ({count = 12, color = COLORS.accent, opacity = 0.35, speed = 1, spread = 1}) => {
	const frame = useCurrentFrame();
	const items = useMemo(
		() =>
			Array.from({length: count}, (_, i) => ({
				seed: i * 17.13,
			})),
		[count],
	);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{items.map((item, i) => {
				const x = 50 + Math.sin(frame * 0.01 * speed + item.seed) * 28 * spread + Math.cos(item.seed) * 8;
				const y = 50 + Math.cos(frame * 0.008 * speed + item.seed * 1.3) * 20 * spread + Math.sin(item.seed * 0.7) * 8;
				const s = 0.7 + (Math.sin(frame * 0.02 + item.seed) + 1) * 0.18;
				const o = opacity * (0.55 + (Math.cos(frame * 0.03 + item.seed) + 1) * 0.22);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${x}%`,
							top: `${y}%`,
							width: 10 + (i % 3) * 4,
							height: 10 + (i % 3) * 4,
							borderRadius: 999,
							transform: `translate(-50%, -50%) scale(${s})`,
							background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${color} 45%, transparent 75%)`,
							opacity: o,
							filter: 'blur(0.2px)',
							boxShadow: `0 0 24px ${color}55`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const MeshBackground: React.FC<{variant?: 'hero' | 'showcase' | 'feature' | 'cta'}> = ({variant = 'hero'}) => {
	const frame = useCurrentFrame();
	const palette =
		variant === 'feature'
			? [COLORS.rose, COLORS.gold2, '#f7e9d8']
			: variant === 'cta'
				? [COLORS.cta, COLORS.gold, COLORS.olive]
				: [COLORS.gold, COLORS.gold2, COLORS.olive];

	return (
		<AbsoluteFill
			style={{
				overflow: 'hidden',
				background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${palette[0]}22 35%, ${palette[1]}18 70%, ${palette[2]}22 100%)`,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: -120,
					background: [
						`radial-gradient(ellipse 70% 55% at ${50 + Math.sin(frame * 0.01) * 12}% ${38 + Math.cos(frame * 0.008) * 10}%, ${palette[0]}88 0%, transparent 62%)`,
						`radial-gradient(ellipse 60% 70% at ${28 + Math.cos(frame * 0.012) * 14}% ${62 + Math.sin(frame * 0.01) * 8}%, ${palette[1]}66 0%, transparent 60%)`,
						`radial-gradient(ellipse 80% 50% at ${72 + Math.sin(frame * 0.014) * 10}% ${30 + Math.cos(frame * 0.01) * 9}%, ${palette[2]}55 0%, transparent 58%)`,
					].join(','),
					filter: 'blur(18px)',
					opacity: 0.95,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `linear-gradient(${frame * 0.08}deg, rgba(255,255,255,0.18), transparent 30%, rgba(255,255,255,0.08) 60%, transparent 100%)`,
					mixBlendMode: 'screen',
					opacity: variant === 'cta' ? 0.55 : 0.35,
				}}
			/>
		</AbsoluteFill>
	);
};

const ShimmerText: React.FC<{text?: string; color?: string; size?: number; align?: 'center' | 'left'}> = ({
	text = 'PTT',
	color = COLORS.ink,
	size = 72,
	align = 'center',
}) => {
	const frame = useCurrentFrame();
	const bgPos = `${(frame * 2) % 200}% 50%`;
	return (
		<div
			style={{
				fontFamily: 'DM Serif Display, Georgia, serif',
				fontSize: size,
				fontWeight: 400,
				lineHeight: 1.02,
				textAlign: align,
				background: `linear-gradient(90deg, ${color} 0%, #fff7d0 35%, ${color} 70%, ${color} 100%)`,
				backgroundSize: '200% 100%',
				backgroundPosition: bgPos,
				WebkitBackgroundClip: 'text',
				color: 'transparent',
				textShadow: '0 10px 30px rgba(51,40,14,0.12)',
			}}
		>
			{text}
		</div>
	);
};

const WordStagger: React.FC<{
	words?: string[];
	startFrame?: number;
	delay?: number;
	fontSize?: number;
	color?: string;
	align?: 'center' | 'left';
}> = ({words = HERO_WORDS, startFrame = 0, delay = 6, fontSize = 72, color = COLORS.ink, align = 'center'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: align === 'center' ? 'center' : 'flex-start'}}>
			{words.map((word, i) => {
				const s = spring({
					frame: frame - startFrame - i * delay,
					fps,
					config: {damping: 18, stiffness: 120, mass: 0.9},
				});
				const opacity = interpolate(s, [0, 1], [0, 1], {extrapolateRight: 'clamp'});
				const y = interpolate(s, [0, 1], [36, 0], {extrapolateRight: 'clamp'});
				const scale = interpolate(s, [0, 1], [0.92, 1], {extrapolateRight: 'clamp'});
				const rot = interpolate(s, [0, 1], [-4, 0], {extrapolateRight: 'clamp'});
				return (
					<div
						key={word + i}
						style={{
							fontFamily: 'DM Serif Display, Georgia, serif',
							fontSize,
							color,
							opacity,
							transform: `translateY(${y}px) scale(${scale}) rotate(${rot}deg)`,
							transformOrigin: 'center center',
							textShadow: '0 10px 30px rgba(51,40,14,0.12)',
						}}
					>
						{word}
					</div>
				);
			})}
		</div>
	);
};

const Cursor: React.FC<{frameOffset?: number; points?: {x: number; y: number; frame: number; click?: boolean}[]}> = ({
	frameOffset = 0,
	points = [
		{x: 74, y: 68, frame: 0},
		{x: 78, y: 68, frame: 18},
		{x: 78, y: 68, frame: 22, click: true},
	],
}) => {
	const frame = useCurrentFrame() - frameOffset;
	if (frame < 0) return null;
	let x = points[0]?.x ?? 0;
	let y = points[0]?.y ?? 0;
	let click = false;
	for (let i = 0; i < points.length - 1; i++) {
		const a = points[i];
		const b = points[i + 1];
		if (frame >= a.frame && frame <= b.frame) {
			const t = interpolate(frame, [a.frame, b.frame], [0, 1], {easing: Easing.inOut(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			x = interpolate(t, [0, 1], [a.x, b.x]);
			y = interpolate(t, [0, 1], [a.y, b.y]);
			break;
		}
		if (frame > b.frame) {
			x = b.x;
			y = b.y;
		}
	}
	const clickPoint = points.find((p) => p.click && Math.abs(frame - p.frame) < 4);
	if (clickPoint) click = true;
	const tip = arrowTipOffsetPx(26);
	return (
		<div
			style={{
				position: 'absolute',
				left: `${x}%`,
				top: `${y}%`,
				transform: `translate(${-tip.dx}px, ${-tip.dy}px)`,
				zIndex: 50,
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					width: 26,
					height: 26,
					transform: click ? 'scale(0.9)' : 'scale(1)',
					filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))',
				}}
			>
				<svg width="26" height="26" viewBox="0 0 24 24" fill="none">
					<path d={CURSOR_ARROW_PATH_D} fill="white" stroke="#1f1a10" strokeWidth="1.4" />
				</svg>
			</div>
			{click ? <div style={{position: 'absolute', inset: -10, borderRadius: 999, border: '2px solid rgba(107,124,61,0.55)', boxShadow: '0 0 0 8px rgba(107,124,61,0.12)'}} /> : null}
		</div>
	);
};

const HighlightRing: React.FC<{x: number; y: number; width: number; height: number; delay?: number}> = ({
	x,
	y,
	width,
	height,
	delay = 0,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 120}});
	const opacity = interpolate(s, [0, 0.2, 1], [0, 1, 0.75], {extrapolateRight: 'clamp'});
	const scale = interpolate(s, [0, 1], [0.7, 1], {extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				left: x - 10,
				top: y - 10,
				width: width + 20,
				height: height + 20,
				borderRadius: 16,
				border: `2px solid rgba(107,124,61,${opacity})`,
				boxShadow: `0 0 0 8px rgba(107,124,61,${opacity * 0.12}), 0 0 30px rgba(107,124,61,${opacity * 0.25})`,
				transform: `scale(${scale})`,
				pointerEvents: 'none',
			}}
		/>
	);
};

const BrowserUI: React.FC<{zoom?: number}> = ({zoom = 1}) => {
	const frame = useCurrentFrame();
	const translatePulse = Math.sin(frame * 0.02) * 2;
	return (
		<div
			style={{
				width: 1280,
				height: 760,
				background: COLORS.paper,
				borderRadius: 18,
				overflow: 'hidden',
				transform: `scale(${zoom}) translateY(${translatePulse}px)`,
				boxShadow: '0 30px 80px -20px rgba(0,0,0,0.28), 0 12px 30px -12px rgba(0,0,0,0.18)',
				position: 'relative',
			}}
		>
			<div style={{padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, #fff9dc 0%, #f7efc4 100%)', borderBottom: '1px solid rgba(51,40,14,0.08)'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
					<div style={{width: 12, height: 12, borderRadius: 999, background: '#ff5f57'}} />
					<div style={{width: 12, height: 12, borderRadius: 999, background: '#ffbd2e'}} />
					<div style={{width: 12, height: 12, borderRadius: 999, background: '#28c840'}} />
				</div>
				<div style={{flex: 1, marginLeft: 24, marginRight: 24, height: 42, borderRadius: 14, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(51,40,14,0.08)', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#7d7447', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 16}}>
					ptt.example.com / translate
				</div>
				<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 14, color: '#7d7447'}}>PTT Studio</div>
			</div>
			<div style={{display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, padding: 28}}>
				<div style={{background: 'linear-gradient(180deg, #fffdf4 0%, #f8f0c8 100%)', borderRadius: 22, boxShadow: '0 18px 40px -12px rgba(0,0,0,0.12)', padding: 24, position: 'relative'}}>
					<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8b7f4a'}}>Narration</div>
					<div style={{marginTop: 12, fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 42, color: COLORS.ink, lineHeight: 1.05}}>Speak once. Reach everyone.</div>
					<div style={{marginTop: 18, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 17, color: '#5c5228', lineHeight: 1.6, maxWidth: 500}}>
						PTT turns your script into multilingual narration with a single click, keeping the tone natural and the workflow simple.
					</div>
					<div style={{marginTop: 24, display: 'flex', gap: 12, alignItems: 'center'}}>
						<div style={{padding: '12px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #ead766 0%, #d3c25c 100%)', color: COLORS.ink, fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 16, boxShadow: '0 12px 28px -12px rgba(0,0,0,0.22)'}}>Translate</div>
						<div style={{padding: '12px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(51,40,14,0.08)', color: '#5c5228', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 16}}>Preview voice</div>
					</div>
					<div style={{marginTop: 28, borderRadius: 18, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(51,40,14,0.08)', padding: 18}}>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
							<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 14, color: '#7d7447', textTransform: 'uppercase', letterSpacing: 1}}>Language</div>
							<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 14, color: '#7d7447'}}>Auto-detect</div>
						</div>
						<div style={{marginTop: 14, display: 'grid', gap: 10}}>
							{['English', 'Español', 'Français', '日本語'].map((lang, i) => (
								<div key={lang} style={{height: 18, borderRadius: 999, background: i === 0 ? 'linear-gradient(90deg, #6b7c3d 0%, #b0a24d 100%)' : 'rgba(107,124,61,0.12)', width: `${92 - i * 12}%`}} />
							))}
						</div>
					</div>
				</div>
				<div style={{display: 'grid', gap: 18}}>
					{[
						{title: 'Translation', value: 'Instant', tone: '#6b7c3d'},
						{title: 'Narration', value: 'Natural', tone: '#d3c25c'},
						{title: 'Accessibility', value: 'Built in', tone: '#eac6c0'},
					].map((card, i) => (
						<div key={card.title} style={{borderRadius: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,245,217,0.92) 100%)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.12)', border: '1px solid rgba(51,40,14,0.08)', padding: 20, transform: `translateY(${Math.sin(frame * 0.02 + i) * 3}px)`}}>
							<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
								<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: '#8b7f4a'}}>{card.title}</div>
								<div style={{width: 14, height: 14, borderRadius: 999, background: card.tone, boxShadow: `0 0 0 8px ${card.tone}22`}} />
							</div>
							<div style={{marginTop: 10, fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 34, color: COLORS.ink}}>{card.value}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

const HeroScene: React.FC<PTTPromoProps> = ({brandName = 'PTT', tagline = 'Multilingual narration made simple'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const exit = interpolate(frame, [100, 120], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = interpolate(frame, [0, 120], [1.03, 0.97], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: exit, transform: `scale(${scale})`}}>
			<MeshBackground variant="hero" />
			<ParticleField count={15} color={COLORS.accent} opacity={0.42} speed={1.1} spread={1.1} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120}}>
				<div style={{maxWidth: 1200, textAlign: 'center'}}>
					<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#6f6437', marginBottom: 18, opacity: interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'})}}>
						Accessible AI for global teams
					</div>
					<WordStagger words={safeWords(`${brandName} ${tagline}`)} startFrame={0} delay={7} fontSize={78} color={COLORS.ink} />
					<div style={{marginTop: 22, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 22, color: '#5c5228', opacity: interpolate(frame, [15, 45], [0, 1], {extrapolateRight: 'clamp'})}}>
						Create one script, then speak to every audience with natural translation and narration.
					</div>
					<div style={{marginTop: 34, display: 'flex', justifyContent: 'center', gap: 16, opacity: interpolate(frame, [30, 60], [0, 1], {extrapolateRight: 'clamp'})}}>
						<div style={{padding: '14px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #6b7c3d 0%, #8b9a54 100%)', color: COLORS.white, fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, boxShadow: '0 12px 28px -12px rgba(0,0,0,0.22)'}}>Translate instantly</div>
						<div style={{padding: '14px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(51,40,14,0.12)', color: COLORS.ink, fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700}}>Preview narration</div>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: '8%', top: '18%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)', filter: 'blur(8px)', opacity: 0.7, mixBlendMode: 'screen'}} />
			<div style={{position: 'absolute', right: '10%', bottom: '14%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,124,61,0.3) 0%, rgba(107,124,61,0.06) 45%, transparent 72%)', filter: 'blur(12px)'}} />
		</AbsoluteFill>
	);
};

const ShowcaseScene: React.FC = () => {
	const frame = useCurrentFrame();
	const enter = spring({frame, fps: 30, config: {damping: 18, stiffness: 90}});
	const zoom = interpolate(frame, [0, 120], [0.96, 1.08], {extrapolateRight: 'clamp'});
	const exit = interpolate(frame, [105, 120], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<MeshBackground variant="showcase" />
			<ParticleField count={10} color={COLORS.olive} opacity={0.28} speed={0.8} spread={0.9} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{transform: `translateY(${interpolate(enter, [0, 1], [120, 0], {extrapolateRight: 'clamp'})}px) scale(${zoom})`, opacity: enter, perspective: 1200}}>
					<FloatingBrowser rotateX={-8} rotateY={12} scale={0.88} enterDelay={0}>
						<BrowserFrame url="ptt.example.com" width={1280} darkMode={false}>
							<div style={{width: 1280, height: 760, background: COLORS.paper, position: 'relative'}}>
								<BrowserUI zoom={1} />
								<Cursor frameOffset={0} points={[{x: 74, y: 68, frame: 0}, {x: 78, y: 68, frame: 18}, {x: 78, y: 68, frame: 22, click: true}]} />
								<HighlightRing x={760} y={420} width={180} height={56} delay={18} />
							</div>
						</BrowserFrame>
					</FloatingBrowser>
				</div>
			</div>
			<div style={{position: 'absolute', left: 80, bottom: 70, width: 420, padding: 22, borderRadius: 22, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.16)', opacity: interpolate(frame, [10, 40], [0, 1], {extrapolateRight: 'clamp'})}}>
				<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#7d7447'}}>Translation + narration</div>
				<div style={{marginTop: 10, fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 34, color: COLORS.ink}}>One click to localize the experience.</div>
				<div style={{marginTop: 10, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 17, color: '#5c5228', lineHeight: 1.55}}>The interface stays simple while the platform handles multilingual output behind the scenes.</div>
			</div>
		</AbsoluteFill>
	);
};

const FeatureScene: React.FC = () => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [0, 40, 80, 120], [1, 1.9, 2.15, 1.02], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
	const exit = interpolate(frame, [100, 120], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<MeshBackground variant="feature" />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 1600, height: 900, position: 'relative', transform: `scale(${zoom})`, transformOrigin: '50% 50%', boxShadow: '0 40px 100px -24px rgba(0,0,0,0.22)', borderRadius: 24, overflow: 'hidden'}}>
					<div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #fff8ef 0%, #f7e9d8 100%)', padding: 42}}>
						<div style={{display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: 28, height: '100%'}}>
							<div style={{borderRadius: 24, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(51,40,14,0.08)', padding: 28, position: 'relative'}}>
								<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: '#8b7f4a'}}>Multilingual feature</div>
								<div style={{marginTop: 12, fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 54, color: COLORS.ink, lineHeight: 1.02}}>Translate the same message into every market.</div>
								<div style={{marginTop: 18, display: 'grid', gap: 14}}>
									{[
										'English — Ready to publish',
										'Español — Listo para publicar',
										'日本語 — すぐに公開',
									].map((line, i) => (
										<div key={line} style={{padding: '16px 18px', borderRadius: 16, background: i === 1 ? 'linear-gradient(135deg, #ead766 0%, #f7efc4 100%)' : 'rgba(255,255,255,0.8)', border: '1px solid rgba(51,40,14,0.08)', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 18, color: '#5c5228', transform: `translateX(${Math.sin(frame * 0.03 + i) * 4}px)`}}>{line}</div>
									))}
								</div>
								<div style={{position: 'absolute', right: 28, bottom: 28, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(234,198,192,0.18) 40%, transparent 72%)', filter: 'blur(10px)', mixBlendMode: 'screen'}} />
							</div>
							<div style={{borderRadius: 24, background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,245,217,0.92) 100%)', border: '1px solid rgba(51,40,14,0.08)', padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
								<div>
									<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: '#8b7f4a'}}>Narration preview</div>
									<div style={{marginTop: 12, fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 40, color: COLORS.ink}}>Natural voice, no extra steps.</div>
								</div>
								<div style={{borderRadius: 20, background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(51,40,14,0.08)', padding: 20}}>
									<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
										<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 16, color: '#5c5228'}}>Voice tone</div>
										<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 16, color: '#5c5228'}}>Warm</div>
									</div>
									<div style={{marginTop: 14, height: 12, borderRadius: 999, background: 'rgba(107,124,61,0.14)'}}>
										<div style={{width: `${60 + Math.sin(frame * 0.04) * 18}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #6b7c3d 0%, #d3c25c 100%)'}} />
									</div>
								</div>
								<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 17, color: '#5c5228', lineHeight: 1.6}}>PTT keeps the workflow approachable while the AI handles the heavy lifting of translation and narration.</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 90, top: 80, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.08) 45%, transparent 72%)', filter: 'blur(12px)', opacity: 0.9}} />
		</AbsoluteFill>
	);
};

const ClosingScene: React.FC<PTTPromoProps> = ({brandName = 'PTT'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 16, stiffness: 90}});
	const exit = interpolate(frame, [130, 150], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<MeshBackground variant="cta" />
			<ParticleField count={18} color={COLORS.white} opacity={0.34} speed={1.3} spread={1.2} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 120}}>
				<div style={{textAlign: 'center', maxWidth: 1100}}>
					<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#f7f0c8', opacity: interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'})}}>Ready for every audience</div>
					<div style={{marginTop: 18, transform: `scale(${interpolate(enter, [0, 1], [0.88, 1], {extrapolateRight: 'clamp'})})`, opacity: enter}}>
						<ShimmerText text={`${brandName} goes global.`} color={COLORS.white} size={78} />
					</div>
					<div style={{marginTop: 18, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 22, color: '#f7f0c8', opacity: interpolate(frame, [12, 40], [0, 1], {extrapolateRight: 'clamp'})}}>A simple platform for translation, narration, and accessible communication.</div>
					<div style={{marginTop: 34, display: 'flex', justifyContent: 'center', gap: 16, opacity: interpolate(frame, [20, 50], [0, 1], {extrapolateRight: 'clamp'})}}>
						<div style={{padding: '16px 26px', borderRadius: 14, background: 'linear-gradient(135deg, #f7efc4 0%, #ead766 100%)', color: COLORS.ink, fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, boxShadow: '0 18px 40px -14px rgba(0,0,0,0.28)'}}>Start translating</div>
						<div style={{padding: '16px 26px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: COLORS.white, fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, backdropFilter: 'blur(16px)'}}>See the demo</div>
					</div>
					<div style={{marginTop: 42, display: 'inline-flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(16px)', boxShadow: '0 18px 40px -14px rgba(0,0,0,0.22)', transform: `translateY(${interpolate(enter, [0, 1], [20, 0], {extrapolateRight: 'clamp'})}px) scale(${interpolate(enter, [0, 1], [0.7, 1], {extrapolateRight: 'clamp'})})`, opacity: enter}}>
						<div style={{width: 54, height: 54, borderRadius: 18, background: 'linear-gradient(135deg, #f7efc4 0%, #ead766 100%)', display: 'grid', placeItems: 'center', color: COLORS.ink, fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 28, transform: `rotate(${interpolate(enter, [0, 1], [-12, 0], {extrapolateRight: 'clamp'})}deg)`}}>P</div>
						<div style={{textAlign: 'left'}}>
							<div style={{fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 34, color: COLORS.white}}>{brandName}</div>
							<div style={{fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 16, color: '#f7f0c8'}}>Built for clarity, reach, and ease.</div>
						</div>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: '12%', top: '18%', width: 260, height: 260, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.18)', boxShadow: '0 0 0 18px rgba(255,255,255,0.04)', opacity: 0.8, transform: `scale(${1 + Math.sin(frame * 0.03) * 0.03})`}} />
			<div style={{position: 'absolute', right: '10%', bottom: '14%', width: 320, height: 320, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.14)', boxShadow: '0 0 0 22px rgba(255,255,255,0.03)', opacity: 0.7, transform: `scale(${1 + Math.cos(frame * 0.025) * 0.03})`}} />
		</AbsoluteFill>
	);
};

export const PTTPromo: React.FC<PTTPromoProps> = ({brandName = 'PTT', tagline = 'Multilingual narration made simple'}) => {
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={HERO_DURATION}>
				<HeroScene brandName={brandName} tagline={tagline} />
			</Sequence>
			<Sequence from={HERO_DURATION - TRANSITION_1} durationInFrames={SHOWCASE_DURATION}>
				<ShowcaseScene />
			</Sequence>
			<Sequence from={HERO_DURATION + SHOWCASE_DURATION - TRANSITION_1 - TRANSITION_2} durationInFrames={FEATURE_DURATION}>
				<FeatureScene />
			</Sequence>
			<Sequence from={HERO_DURATION + SHOWCASE_DURATION + FEATURE_DURATION - TRANSITION_1 - TRANSITION_2 - TRANSITION_3} durationInFrames={CTA_DURATION}>
				<ClosingScene brandName={brandName} />
			</Sequence>
		</AbsoluteFill>
	);
};

export const PTTPromoDurationInFrames = TOTAL_DURATION;
export const PTTPromoDefaultProps: Required<PTTPromoProps> = {
	brandName: 'PTT',
	tagline: 'Multilingual narration made simple',
};
