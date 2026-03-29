import React, {CSSProperties, useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BrowserFrame, FloatingBrowser} from './BrowserFrame';
import {arrowTipOffsetPx, CURSOR_ARROW_PATH_D} from './cursorTipOffset';

export type FlyerBrand = {
	name: string;
	tagline: string;
	logoText: string;
	primary: string;
	secondary: string;
	accent: string;
	bgLight: string;
	bgMid: string;
	bgDark: string;
	fontDisplay: string;
	fontBody: string;
};

export const DEFAULT_FLYER_BRAND: FlyerBrand = {
	name: 'PTT',
	tagline: 'Multilingual publishing made effortless',
	logoText: 'PTT',
	primary: '#d3c25c',
	secondary: '#ead766',
	accent: '#6b7c3d',
	bgLight: '#fdfbf0',
	bgMid: '#d3c25c',
	bgDark: '#b0a24d',
	fontDisplay: '"DM Serif Display", Georgia, serif',
	fontBody: '"DM Sans", Inter, system-ui, sans-serif',
};

type Props = {
	flyerBrand: FlyerBrand;
};

const sceneDurations = [120, 120, 120, 120, 120, 120, 120, 120];
const sceneStarts = sceneDurations.reduce<number[]>((acc, duration, index) => {
	acc.push((acc[index - 1] ?? 0) + (index === 0 ? 0 : sceneDurations[index - 1]));
	return acc;
}, []);
const totalDuration = sceneDurations.reduce((sum, d) => sum + d, 0);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const SceneShell: React.FC<{
	brand: FlyerBrand;
	frame: number;
	children: React.ReactNode;
	variant: 'hero' | 'browser' | 'zoom' | 'global' | 'ease' | 'ai' | 'cta' | 'close';
}> = ({brand, frame, children, variant}) => {
	const bg = useMemo(() => {
		const t = frame * 0.01;
		const x1 = 50 + Math.sin(t) * 18;
		const y1 = 35 + Math.cos(t * 1.2) * 14;
		const x2 = 20 + Math.cos(t * 0.8) * 20;
		const y2 = 70 + Math.sin(t * 1.1) * 12;
		const x3 = 75 + Math.sin(t * 1.4) * 10;
		const y3 = 25 + Math.cos(t * 0.9) * 10;
		const x4 = 55 + Math.cos(t * 1.7) * 16;
		const y4 = 60 + Math.sin(t * 1.3) * 14;
		const palette =
			variant === 'cta' || variant === 'close'
				? [brand.bgDark, brand.primary, brand.secondary, brand.accent]
				: [brand.primary, brand.secondary, brand.bgDark, brand.accent];
		return {
			background: `
				radial-gradient(ellipse 80% 60% at ${x1}% ${y1}%, ${palette[0]}cc 0%, transparent 65%),
				radial-gradient(ellipse 70% 80% at ${x2}% ${y2}%, ${palette[1]}88 0%, transparent 60%),
				radial-gradient(ellipse 90% 50% at ${x3}% ${y3}%, ${palette[2]}66 0%, transparent 62%),
				radial-gradient(ellipse 60% 70% at ${x4}% ${y4}%, ${palette[3]}55 0%, transparent 70%),
				linear-gradient(135deg, ${brand.bgLight} 0%, ${brand.bgMid} 48%, ${brand.bgDark} 100%)
			`,
		};
	}, [brand.accent, brand.bgDark, brand.bgLight, brand.bgMid, brand.primary, brand.secondary, frame, variant]);

	return (
		<AbsoluteFill style={{overflow: 'hidden', ...bg}}>
			<div
				style={{
					position: 'absolute',
					inset: -120,
					background:
						'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.02) 65%, rgba(255,255,255,0.16) 100%)',
					transform: `translateX(${Math.sin(frame * 0.02) * 120}px) rotate(${Math.sin(frame * 0.01) * 2}deg)`,
					opacity: 0.45,
					filter: 'blur(18px)',
					mixBlendMode: 'screen',
				}}
			/>
			{children}
		</AbsoluteFill>
	);
};

const ParticleField: React.FC<{count: number; color: string; frame: number; spread?: number}> = ({
	count,
	color,
	frame,
	spread = 1,
}) => {
	return (
		<>
			{Array.from({length: count}).map((_, i) => {
				const p = i / count;
				const x = (Math.sin(frame * 0.01 + i * 1.7) * 0.5 + 0.5) * 100;
				const y = (Math.cos(frame * 0.013 + i * 2.1) * 0.5 + 0.5) * 100;
				const s = 2 + ((i * 13) % 7);
				const opacity = 0.18 + (Math.sin(frame * 0.03 + i) * 0.5 + 0.5) * 0.35;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${x}%`,
							top: `${y}%`,
							width: s * spread,
							height: s * spread,
							borderRadius: 999,
							background: color,
							opacity,
							filter: 'blur(0.2px)',
							transform: `translate(-50%, -50%) scale(${0.8 + Math.sin(frame * 0.02 + p * 8) * 0.2})`,
							boxShadow: `0 0 18px ${color}55`,
						}}
					/>
				);
			})}
		</>
	);
};

const Orb: React.FC<{x: number; y: number; size: number; color: string; frame: number; blur?: number}> = ({
	x,
	y,
	size,
	color,
	frame,
	blur = 40,
}) => (
	<div
		style={{
			position: 'absolute',
			left: `${x}%`,
			top: `${y}%`,
			width: size,
			height: size,
			borderRadius: '50%',
			background: `radial-gradient(circle, ${color}aa 0%, ${color}22 35%, transparent 70%)`,
			filter: `blur(${blur}px)`,
			transform: `translate(-50%, -50%) translate(${Math.sin(frame * 0.01) * 20}px, ${Math.cos(frame * 0.012) * 16}px)`,
			mixBlendMode: 'screen',
			pointerEvents: 'none',
		}}
	/>
);

const WordByWordTitle: React.FC<{text: string; frame: number; brand: FlyerBrand; delay?: number}> = ({
	text,
	frame,
	brand,
	delay = 0,
}) => {
	const words = text.split(' ');
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18}}>
			{words.map((word, i) => {
				const s = spring({
					frame: frame - delay - i * 6,
					fps: 30,
					config: {damping: 18, stiffness: 120, mass: 0.8},
				});
				const opacity = interpolate(s, [0, 1], [0, 1], {extrapolateRight: 'clamp'});
				const y = interpolate(s, [0, 1], [42, 0], {extrapolateRight: 'clamp'});
				const scale = interpolate(s, [0, 1], [0.92, 1], {extrapolateRight: 'clamp'});
				return (
					<span
						key={word + i}
						style={{
							display: 'inline-block',
							fontFamily: brand.fontDisplay,
							fontSize: 78,
							lineHeight: 1,
							color: '#33280e',
							textShadow: '0 2px 0 rgba(255,255,255,0.35), 0 18px 40px rgba(0,0,0,0.12)',
							opacity,
							transform: `translateY(${y}px) scale(${scale})`,
							letterSpacing: '-0.03em',
						}}
					>
						{word}
					</span>
				);
			})}
		</div>
	);
};

const ShimmerText: React.FC<{children: React.ReactNode; frame: number; color?: string}> = ({children, frame, color}) => {
	const pos = (frame * 2.5) % 200;
	return (
		<span
			style={{
				backgroundImage: `linear-gradient(90deg, ${color ?? '#fff'} 0%, rgba(255,255,255,0.95) 35%, ${color ?? '#fff'} 70%)`,
				backgroundSize: '200% 100%',
				backgroundPosition: `${pos}% 0%`,
				WebkitBackgroundClip: 'text',
				color: 'transparent',
				textShadow: 'none',
			}}
		>
			{children}
		</span>
	);
};

const HeroScene: React.FC<{brand: FlyerBrand}> = ({brand}) => {
	const frame = useCurrentFrame();
	const exit = interpolate(frame, [100, 120], [1, 0], {extrapolateRight: 'clamp'});
	return (
		<SceneShell brand={brand} frame={frame} variant="hero">
			<ParticleField count={15} color={brand.accent} frame={frame} spread={1.2} />
			<Orb x={18} y={24} size={420} color={brand.secondary} frame={frame} blur={60} />
			<Orb x={82} y={72} size={520} color={brand.primary} frame={frame} blur={70} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					padding: 80,
					opacity: exit,
					transform: `scale(${interpolate(exit, [0, 1], [0.97, 1], {extrapolateRight: 'clamp'})})`,
				}}
			>
				<WordByWordTitle text={brand.name} frame={frame} brand={brand} />
				<div
					style={{
						marginTop: 22,
						fontFamily: brand.fontBody,
						fontSize: 28,
						fontWeight: 500,
						color: '#5c5228',
						opacity: interpolate(frame, [18, 42], [0, 1], {extrapolateRight: 'clamp'}),
						transform: `translateY(${interpolate(frame, [18, 42], [18, 0], {extrapolateRight: 'clamp'})}px)`,
					}}
				>
					{brand.tagline}
				</div>
				<div
					style={{
						marginTop: 28,
						padding: '12px 18px',
						borderRadius: 999,
						background: 'rgba(255,255,255,0.28)',
						backdropFilter: 'blur(14px)',
						border: '1px solid rgba(255,255,255,0.28)',
						fontFamily: brand.fontBody,
						fontSize: 14,
						letterSpacing: '0.18em',
						textTransform: 'uppercase',
						color: '#4f4520',
						opacity: interpolate(frame, [30, 60], [0, 1], {extrapolateRight: 'clamp'}),
					}}
				>
					Multilingual • Accessible • Modern
				</div>
				<div
					style={{
						position: 'absolute',
						bottom: 90,
						fontFamily: brand.fontBody,
						fontSize: 16,
						color: '#6b7c3d',
						opacity: interpolate(frame, [60, 90], [0, 1], {extrapolateRight: 'clamp'}),
					}}
				>
					<ShimmerText frame={frame} color="#6b7c3d">
						Built for global audiences
					</ShimmerText>
				</div>
			</div>
		</SceneShell>
	);
};

const BrowserScene: React.FC<{brand: FlyerBrand}> = ({brand}) => {
	const frame = useCurrentFrame();
	const local = frame - 150;
	const browserEnter = spring({frame: local - 10, fps: 30, config: {damping: 18, stiffness: 70}});
	const zoom = interpolate(local, [0, 120], [0.95, 1.08], {extrapolateRight: 'clamp'});

	const canvas = {w: 1200, h: 720, inset: 42};
	const panelTop = 132;
	const leftPanelW = 340;
	const rightPanelW = 720;
	const rightPanelLeft = canvas.w - canvas.inset - rightPanelW;
	const hitRect = {l: 470, t: 170, w: 120, h: 54};
	const clickTarget = {
		x: rightPanelLeft + hitRect.l + hitRect.w / 2,
		y: panelTop + hitRect.t + hitRect.h / 2,
	};
	const cursorStart = {
		x: canvas.inset + leftPanelW * 0.55,
		y: panelTop + 200,
	};
	const cursorX = interpolate(
		local,
		[30, 70, 110],
		[cursorStart.x, (cursorStart.x + clickTarget.x) / 2, clickTarget.x],
		{extrapolateRight: 'clamp'}
	);
	const cursorY = interpolate(
		local,
		[30, 70, 110],
		[cursorStart.y, (cursorStart.y + clickTarget.y) / 2, clickTarget.y],
		{extrapolateRight: 'clamp'}
	);
	const cursorTip = arrowTipOffsetPx(24);
	const cursorLeft = cursorX - cursorTip.dx;
	const cursorTop = cursorY - cursorTip.dy;

	const clickPulse = interpolate(local, [70, 76, 90], [0, 1, 0], {extrapolateRight: 'clamp'});
	return (
		<SceneShell brand={brand} frame={frame} variant="browser">
			<Orb x={20} y={20} size={360} color={brand.secondary} frame={frame} blur={70} />
			<Orb x={84} y={78} size={460} color={brand.primary} frame={frame} blur={80} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `translateY(${interpolate(browserEnter, [0, 1], [120, 0], {extrapolateRight: 'clamp'})}px) scale(${zoom})`,
					opacity: browserEnter,
				}}
			>
				<FloatingBrowser rotateX={-8} rotateY={12} scale={0.86} enterDelay={0}>
					<BrowserFrame url="ptt.platform/translate" width={1200} darkMode>
						<div
							style={{
								width: 1200,
								height: 720,
								background: '#faf5d9',
								fontFamily: brand.fontBody,
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(234,215,102,0.55), transparent 40%), radial-gradient(circle at 80% 70%, rgba(107,124,61,0.18), transparent 35%)'}} />
							<div style={{position: 'absolute', left: 42, top: 34, fontSize: 14, color: '#8a7d44', letterSpacing: '0.18em', textTransform: 'uppercase'}}>Translation & narration</div>
							<div style={{position: 'absolute', left: 42, top: 74, fontSize: 34, fontWeight: 700, color: '#5c5228'}}>One click to speak every language</div>
							<div style={{position: 'absolute', left: 42, top: 132, width: 340, height: 500, borderRadius: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.72))', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.5)', padding: 24}}>
								<div style={{fontSize: 16, fontWeight: 700, color: '#5c5228'}}>Narration</div>
								<div style={{marginTop: 14, fontSize: 15, color: '#6a5f33', lineHeight: 1.5}}>PTT automatically adapts your message for global audiences with natural pacing and clear delivery.</div>
								<div style={{marginTop: 22, padding: 16, borderRadius: 16, background: 'rgba(234,215,102,0.35)', border: '1px solid rgba(107,124,61,0.18)'}}>
									<div style={{fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7a6f3d'}}>Preview</div>
									<div style={{marginTop: 10, fontSize: 18, fontWeight: 700, color: '#33280e'}}>Hello, welcome to PTT.</div>
								</div>
								<div style={{marginTop: 18, display: 'flex', gap: 10, alignItems: 'center'}}>
									<div style={{width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #d3c25c, #6b7c3d)', boxShadow: '0 12px 28px -12px rgba(107,124,61,0.55)'}} />
									<div>
										<div style={{fontSize: 14, fontWeight: 700, color: '#5c5228'}}>Voice style</div>
										<div style={{fontSize: 13, color: '#7a6f3d'}}>Warm, concise, accessible</div>
									</div>
								</div>
							</div>
							<div style={{position: 'absolute', right: 42, top: 132, width: 720, height: 500, borderRadius: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.5)', padding: 24}}>
								<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
									<div>
										<div style={{fontSize: 16, fontWeight: 700, color: '#5c5228'}}>Audience settings</div>
										<div style={{fontSize: 13, color: '#7a6f3d'}}>Choose languages, tone, and narration speed</div>
									</div>
									<div style={{padding: '10px 16px', borderRadius: 12, background: '#ead766', color: '#33280e', fontWeight: 700, boxShadow: '0 12px 28px -12px rgba(0,0,0,0.22)'}}>Translate</div>
								</div>
								<div style={{marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
									{['English', 'Español', 'Français', '日本語'].map((lang, i) => (
										<div key={lang} style={{padding: 18, borderRadius: 10, background: i === 1 ? 'rgba(234,215,102,0.45)' : 'rgba(255,255,255,0.8)', boxShadow: '0 0 10px rgba(0,0,0,0.2)', border: '1px solid rgba(107,124,61,0.12)'}}>
											<div style={{fontSize: 14, fontWeight: 700, color: '#5c5228'}}>{lang}</div>
											<div style={{marginTop: 8, fontSize: 13, color: '#7a6f3d'}}>Auto narration ready</div>
										</div>
									))}
								</div>
								<div style={{position: 'absolute', left: hitRect.l, top: hitRect.t, width: hitRect.w, height: hitRect.h, borderRadius: 16, border: `3px solid rgba(107,124,61,${0.15 + clickPulse * 0.65})`, boxShadow: `0 0 0 12px rgba(107,124,61,${clickPulse * 0.08})`, transform: `scale(${1 + clickPulse * 0.08})`}} />
							</div>
							<div style={{position: 'absolute', left: cursorLeft, top: cursorTop, width: 24, height: 24, pointerEvents: 'none', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d={CURSOR_ARROW_PATH_D} fill="white" stroke="black" strokeWidth="1.5" />
								</svg>
							</div>
						</div>
					</BrowserFrame>
				</FloatingBrowser>
			</div>
		</SceneShell>
	);
};

const ZoomScene: React.FC<{brand: FlyerBrand}> = ({brand}) => {
	const frame = useCurrentFrame();
	const local = frame - 300;
	const zoom = interpolate(local, [0, 40, 80, 120], [1, 1.55, 1.9, 1.25], {
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.quad),
	});
	const x = interpolate(local, [0, 40, 80, 120], [0, -120, -220, -40], {extrapolateRight: 'clamp'});
	const y = interpolate(local, [0, 40, 80, 120], [0, -40, -80, -10], {extrapolateRight: 'clamp'});
	return (
		<SceneShell brand={brand} frame={frame} variant="zoom">
			<Orb x={18} y={28} size={420} color={brand.secondary} frame={frame} blur={70} />
			<Orb x={84} y={74} size={520} color={brand.primary} frame={frame} blur={80} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{transform: `translate(${x}px, ${y}px) scale(${zoom})`, transformOrigin: '50% 50%', width: 1200, height: 720, borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.35)', background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.22)'}}>
					<div style={{width: '100%', height: '100%', background: 'linear-gradient(180deg, #eac6c0 0%, #f7e8e2 100%)', position: 'relative', fontFamily: brand.fontBody}}>
						<div style={{position: 'absolute', left: 48, top: 44, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a5f5a'}}>Multilingual feature</div>
						<div style={{position: 'absolute', left: 48, top: 78, fontSize: 38, fontWeight: 700, color: '#5b3d3a'}}>Speak to every audience, naturally</div>
						<div style={{position: 'absolute', left: 48, top: 150, width: 520, height: 470, borderRadius: 24, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.22)', padding: 24}}>
							<div style={{fontSize: 16, fontWeight: 700, color: '#5b3d3a'}}>Source text</div>
							<div style={{marginTop: 14, fontSize: 18, lineHeight: 1.6, color: '#6f4d49'}}>PTT turns one message into a polished multilingual experience. The translation updates live as the narration adapts.</div>
							<div style={{marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap'}}>
								{['English', 'Español', 'Deutsch', '日本語', 'العربية'].map((lang, i) => (
									<div key={lang} style={{padding: '10px 14px', borderRadius: 999, background: i === 0 ? '#ead766' : 'rgba(255,255,255,0.8)', color: '#5b3d3a', fontWeight: 700, boxShadow: '0 0 10px rgba(0,0,0,0.2)'}}>{lang}</div>
								))}
							</div>
						</div>
						<div style={{position: 'absolute', right: 48, top: 150, width: 560, height: 470, borderRadius: 24, background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.76))', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.22)', padding: 24}}>
							<div style={{fontSize: 16, fontWeight: 700, color: '#5b3d3a'}}>Live translation</div>
							<div style={{marginTop: 18, display: 'grid', gap: 14}}>
								{[
									'Hello, welcome to PTT.',
									'Hola, bienvenido a PTT.',
									'Bonjour, bienvenue sur PTT.',
								].map((line, i) => {
									const p = clamp01(interpolate(local, [18 + i * 12, 60 + i * 12], [0, 1], {extrapolateRight: 'clamp'}));
									return (
										<div key={line} style={{padding: 18, borderRadius: 16, background: `rgba(234,215,102,${0.18 + p * 0.22})`, border: '1px solid rgba(107,124,61,0.14)', transform: `translateY(${(1 - p) * 18}px)`, opacity: p}}>
											<div style={{fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8a7d44'}}>Language {i + 1}</div>
											<div style={{marginTop: 8, fontSize: 20, fontWeight: 700, color: '#33280e'}}>{line}</div>
										</div>
									);
								})}
							</div>
							<div style={{position: 'absolute', right: 28, bottom: 28, width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(107,124,61,0.35)', boxShadow: '0 0 0 18px rgba(107,124,61,0.08)'}} />
						</div>
						<div style={{position: 'absolute', right: 110, top: 110, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0.05) 65%, transparent 70%)', filter: 'blur(8px)', mixBlendMode: 'screen'}} />
					</div>
				</div>
			</div>
		</SceneShell>
	);
};

const CTA: React.FC<{brand: FlyerBrand}> = ({brand}) => {
	const frame = useCurrentFrame();
	const local = frame - 1050;
	const scale = interpolate(local, [0, 30, 90, 120], [0.96, 1.02, 1.08, 1], {extrapolateRight: 'clamp'});
	const logoSpring = spring({frame: local - 18, fps: 30, config: {damping: 14, stiffness: 90}});
	return (
		<SceneShell brand={brand} frame={frame} variant="cta">
			<ParticleField count={24} color={brand.secondary} frame={frame} spread={1.4} />
			<Orb x={18} y={20} size={520} color={brand.secondary} frame={frame} blur={80} />
			<Orb x={82} y={78} size={620} color={brand.primary} frame={frame} blur={90} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: `scale(${scale})`, opacity: interpolate(local, [0, 120], [0, 1], {extrapolateRight: 'clamp'})}}>
				<div style={{fontFamily: brand.fontBody, fontSize: 14, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#5c5228'}}>Ready when you are</div>
				<div style={{marginTop: 18, fontFamily: brand.fontDisplay, fontSize: 72, color: '#33280e', textAlign: 'center', lineHeight: 1.05}}>
					<ShimmerText frame={frame} color="#33280e">Make every message global</ShimmerText>
				</div>
				<div style={{marginTop: 20, fontFamily: brand.fontBody, fontSize: 24, color: '#5c5228', maxWidth: 900, textAlign: 'center'}}>PTT helps teams translate, narrate, and publish with a modern workflow that feels effortless from the first click.</div>
				<div style={{marginTop: 34, display: 'flex', gap: 18, alignItems: 'center'}}>
					<div style={{padding: '16px 24px', borderRadius: 14, background: 'linear-gradient(135deg, #6b7c3d 0%, #4f5f2d 100%)', color: 'white', fontFamily: brand.fontBody, fontSize: 18, fontWeight: 700, boxShadow: '0 12px 28px -12px rgba(0,0,0,0.35), 0 0 0 0 rgba(107,124,61,0.35)'}}>
						Get started
					</div>
					<div style={{padding: '16px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', color: '#33280e', fontFamily: brand.fontBody, fontSize: 18, fontWeight: 700}}>
						See the demo
					</div>
				</div>
				<div style={{marginTop: 48, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${interpolate(logoSpring, [0, 1], [0.6, 1], {extrapolateRight: 'clamp'})}) rotate(${interpolate(logoSpring, [0, 1], [-12, 0], {extrapolateRight: 'clamp'})}deg)`, boxShadow: '0 18px 40px -12px rgba(0,0,0,0.22)'}}>
					<div style={{fontFamily: brand.fontDisplay, fontSize: 54, color: '#33280e'}}>{brand.logoText}</div>
				</div>
			</div>
		</SceneShell>
	);
};

const CloseScene: React.FC<{brand: FlyerBrand}> = ({brand}) => {
	const frame = useCurrentFrame();
	const local = frame - 1230;
	const fade = interpolate(local, [0, 90, 120], [0, 1, 0.96], {extrapolateRight: 'clamp'});
	return (
		<SceneShell brand={brand} frame={frame} variant="close">
			<ParticleField count={30} color={brand.accent} frame={frame} spread={1.5} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: fade, transform: `scale(${interpolate(local, [0, 120], [0.98, 1], {extrapolateRight: 'clamp'})})`}}>
				<div style={{fontFamily: brand.fontDisplay, fontSize: 86, color: '#33280e', textAlign: 'center'}}>{brand.name}</div>
				<div style={{marginTop: 18, fontFamily: brand.fontBody, fontSize: 26, color: '#5c5228', textAlign: 'center', maxWidth: 980}}>Accessible storytelling, translated for the world.</div>
				<div style={{marginTop: 28, padding: '12px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.28)', fontFamily: brand.fontBody, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4f4520'}}>Thank you for watching</div>
			</div>
		</SceneShell>
	);
};

export const FlyerShowcase: React.FC<Props> = ({flyerBrand}) => {
	return (
		<AbsoluteFill>
			<HeroScene brand={flyerBrand} />
			<BrowserScene brand={flyerBrand} />
			<ZoomScene brand={flyerBrand} />
			<HeroScene brand={flyerBrand} />
			<BrowserScene brand={flyerBrand} />
			<ZoomScene brand={flyerBrand} />
			<CTA brand={flyerBrand} />
			<CloseScene brand={flyerBrand} />
		</AbsoluteFill>
	);
};

export const FLYER_SHOWCASE_DURATION_IN_FRAMES = totalDuration;
