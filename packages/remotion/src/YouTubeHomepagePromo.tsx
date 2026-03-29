import React, {CSSProperties} from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {LightLeak} from '@remotion/light-leaks';
import {FloatingBrowser, BrowserFrame} from './BrowserFrame';
import {arrowTipOffsetPx, CURSOR_ARROW_PATH_D} from './cursorTipOffset';

export type YouTubeHomepagePromoProps = {
	title?: string;
	tagline?: string;
	accent?: string;
	fontFamily?: string;
};

const FPS = 30;
const FONT_FAMILY = 'Roboto, Arial, sans-serif';
const YT_RED = '#FF0000';
const YT_TEXT = '#0f0f0f';
const YT_SUB = '#606060';

const scene1Duration = 210;
const scene2Duration = 180;
const scene3Duration = 210;
const scene4Duration = 210;
const scene5Duration = 210;
const scene6Duration = 210;
const scene7Duration = 210;
const scene8Duration = 210;
const scene9Duration = 210;
const scene10Duration = 210;

const transition1 = 15;
const transition2 = 12;
const transition3 = 18;
const transition4 = 20;
const transition5 = 0;
const transition6 = 15;
const transition7 = 16;
const transition8 = 14;
const transition9 = 20;

const totalDuration =
	scene1Duration +
	scene2Duration +
	scene3Duration +
	scene4Duration +
	scene5Duration +
	scene6Duration +
	scene7Duration +
	scene8Duration +
	scene9Duration +
	scene10Duration -
	transition1 -
	transition2 -
	transition3 -
	transition4 -
	transition5 -
	transition6 -
	transition7 -
	transition8 -
	transition9;

/** Single source of truth for `<Composition durationInFrames>` in `Root.tsx`. */
export const YOUTUBE_HOMEPAGE_PROMO_DURATION_IN_FRAMES = totalDuration;

const particleSet = (count: number, tint = '#ffbcbc') =>
	new Array(count).fill(true).map((_, i) => ({
		id: i,
		left: (i * 97) % 100,
		top: (i * 53) % 100,
		size: 2 + (i % 5) * 2.4,
		delay: (i * 4) % 30,
		drift: 8 + (i % 7) * 4,
		opacity: 0.08 + (i % 5) * 0.03,
		color: i % 4 === 0 ? tint : '#d9d9d9',
	}));

type CursorPoint = {x: number; y: number; frame: number; click?: boolean};

const FullFrame: React.FC<{children?: React.ReactNode; style?: CSSProperties}> = ({
	children,
	style,
}) => {
	return (
		<AbsoluteFill
			style={{
				fontFamily: FONT_FAMILY,
				overflow: 'hidden',
				...(style ?? {}),
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

const MeshBackground: React.FC<{
	colors?: string[];
	cooler?: boolean;
}> = ({colors = ['#ffffff', '#f7f7f7', '#ffe9e9', '#fff3f3'], cooler = false}) => {
	const frame = useCurrentFrame();
	const c = colors;
	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					inset: -140,
					background: cooler
						? `
            radial-gradient(circle at ${20 + Math.sin(frame * 0.012) * 12}% ${18 + Math.cos(frame * 0.009) * 10}%, ${c[0]} 0%, transparent 40%),
            radial-gradient(circle at ${76 + Math.cos(frame * 0.01) * 12}% ${28 + Math.sin(frame * 0.012) * 8}%, ${c[1]} 0%, transparent 38%),
            radial-gradient(circle at ${56 + Math.sin(frame * 0.007) * 11}% ${72 + Math.cos(frame * 0.011) * 10}%, ${c[2]} 0%, transparent 44%),
            radial-gradient(circle at ${28 + Math.cos(frame * 0.008) * 8}% ${78 + Math.sin(frame * 0.01) * 8}%, ${c[3]} 0%, transparent 48%),
            linear-gradient(145deg, #ffffff 0%, #f6f8fb 45%, #f3f4f8 100%)`
						: `
            radial-gradient(circle at ${18 + Math.sin(frame * 0.01) * 14}% ${20 + Math.cos(frame * 0.008) * 10}%, ${c[0]} 0%, transparent 42%),
            radial-gradient(circle at ${80 + Math.cos(frame * 0.011) * 11}% ${22 + Math.sin(frame * 0.009) * 9}%, ${c[1]} 0%, transparent 40%),
            radial-gradient(circle at ${58 + Math.sin(frame * 0.007) * 9}% ${74 + Math.cos(frame * 0.012) * 10}%, ${c[2]} 0%, transparent 44%),
            radial-gradient(circle at ${30 + Math.cos(frame * 0.009) * 8}% ${72 + Math.sin(frame * 0.014) * 7}%, ${c[3]} 0%, transparent 48%),
            linear-gradient(135deg, #ffffff 0%, #f8f8f8 48%, #fff5f5 100%)`,
					filter: 'saturate(1.02)',
				}}
			/>
		</AbsoluteFill>
	);
};

const Particles: React.FC<{
	count?: number;
	tint?: string;
}> = ({count = 12, tint = '#ffd0d0'}) => {
	const frame = useCurrentFrame();
	const particles = particleSet(count, tint);
	return (
		<AbsoluteFill>
			{particles.map((p) => {
				const driftY = Math.sin((frame + p.delay) * 0.018) * p.drift;
				const driftX = Math.cos((frame + p.delay) * 0.013) * (p.drift * 0.7);
				return (
					<div
						key={p.id}
						style={{
							position: 'absolute',
							left: `${p.left}%`,
							top: `${p.top}%`,
							width: p.size,
							height: p.size,
							borderRadius: 999,
							background: p.color,
							opacity: p.opacity,
							transform: `translate(${driftX}px, ${driftY}px)`,
							boxShadow: `0 0 ${p.size * 6}px ${p.color}`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const RedOrbs: React.FC<{count?: number}> = ({count = 2}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			{new Array(count).fill(true).map((_, i) => {
				const size = i === 0 ? 280 : 220;
				const x = i === 0 ? 18 : 78;
				const y = i === 0 ? 72 : 22;
				const dx = Math.sin(frame * 0.011 + i) * 24;
				const dy = Math.cos(frame * 0.012 + i * 0.8) * 18;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${x}%`,
							top: `${y}%`,
							width: size,
							height: size,
							borderRadius: '50%',
							transform: `translate(${dx}px, ${dy}px)`,
							background:
								i === 0
									? 'radial-gradient(circle, rgba(255,0,0,0.16) 0%, rgba(255,0,0,0.05) 40%, rgba(255,255,255,0) 72%)'
									: 'radial-gradient(circle, rgba(255,90,90,0.14) 0%, rgba(255,90,90,0.04) 42%, rgba(255,255,255,0) 72%)',
							filter: 'blur(32px)',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const LensSweep: React.FC<{warm?: boolean}> = ({warm = true}) => {
	const frame = useCurrentFrame();
	const x = interpolate(frame, [0, 210], [-20, 110], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				position: 'absolute',
				left: `${x}%`,
				top: '18%',
				width: 520,
				height: 520,
				transform: 'translate(-50%, -50%) rotate(-18deg)',
				background: warm
					? 'radial-gradient(circle, rgba(255,255,255,0.46) 0%, rgba(255,190,190,0.18) 26%, rgba(255,255,255,0) 64%)'
					: 'radial-gradient(circle, rgba(255,255,255,0.38) 0%, rgba(205,224,255,0.16) 28%, rgba(255,255,255,0) 64%)',
				filter: 'blur(18px)',
				mixBlendMode: 'screen',
				opacity: 0.7,
			}}
		/>
	);
};

const SceneExit: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const exitStart = durationInFrames - 20;
	const opacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
		clamp: true,
	} as never);
	const scale = interpolate(frame, [exitStart, durationInFrames], [1, 0.965], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return <AbsoluteFill style={{opacity, transform: `scale(${scale})`, pointerEvents: 'none'}} />;
};

const WordStagger: React.FC<{
	text?: string;
	fontSize?: number;
	start?: number;
	stagger?: number;
	color?: string;
	fontWeight?: number;
	letterSpacing?: number;
}> = ({
	text = 'YouTube',
	fontSize = 92,
	start = 0,
	stagger = 3,
	color = YT_TEXT,
	fontWeight = 700,
	letterSpacing = -2,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = (text ?? '').split(' ');
	return (
		<div
			style={{
				display: 'flex',
				gap: 18,
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'center',
				fontSize,
				fontWeight,
				letterSpacing,
				color,
				lineHeight: 1,
			}}
		>
			{words.map((word, i) => {
				const reveal = spring({
					frame: frame - start - i * stagger,
					fps,
					config: {damping: 18, stiffness: 90},
					durationInFrames: 24,
				});
				const opacity = interpolate(reveal, [0, 1], [0, 1]);
				const translateY = interpolate(reveal, [0, 1], [24, 0]);
				return (
					<span
						key={word + i}
						style={{
							opacity,
							transform: `translateY(${translateY}px)`,
							display: 'inline-block',
						}}
					>
						{word}
					</span>
				);
			})}
		</div>
	);
};

const Cursor: React.FC<{
	points?: CursorPoint[];
	startDelay?: number;
}> = ({points = [{x: 0, y: 0, frame: 0}], startDelay = 0}) => {
	const frame = useCurrentFrame() - startDelay;
	let x = points[0]?.x ?? 0;
	let y = points[0]?.y ?? 0;
	let clickFrame: number | null = null;

	for (let i = 0; i < points.length - 1; i++) {
		const from = points[i];
		const to = points[i + 1];
		if (frame >= from.frame && frame <= to.frame) {
			const t = interpolate(frame, [from.frame, to.frame], [0, 1], {
				easing: Easing.inOut(Easing.quad),
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
			x = interpolate(t, [0, 1], [from.x, to.x]);
			y = interpolate(t, [0, 1], [from.y, to.y]);
		}
		if (to.click) {
			clickFrame = to.frame;
		}
	}

	if (frame > (points[points.length - 1]?.frame ?? 0)) {
		x = points[points.length - 1]?.x ?? x;
		y = points[points.length - 1]?.y ?? y;
	}

	const clicking = clickFrame !== null && Math.abs(frame - clickFrame) <= 4;
	const scale = clicking
		? interpolate(Math.abs(frame - (clickFrame ?? 0)), [0, 4], [0.86, 1], {
				extrapolateRight: 'clamp',
		  })
		: 1;

	if (frame < 0) {
		return null;
	}

	const tip = arrowTipOffsetPx(28);
	return (
		<div
			style={{
				position: 'absolute',
				left: x - tip.dx,
				top: y - tip.dy,
				width: 28,
				height: 28,
				transform: `scale(${scale})`,
				zIndex: 30,
				filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.22))',
			}}
		>
			<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
				<path d={CURSOR_ARROW_PATH_D} fill="white" stroke="#111" strokeWidth="1.5" />
			</svg>
			{clicking ? (
				<div
					style={{
						position: 'absolute',
						left: -10,
						top: -10,
						width: 46,
						height: 46,
						borderRadius: 999,
						border: '2px solid rgba(255,0,0,0.35)',
						background: 'rgba(255,0,0,0.08)',
					}}
				/>
			) : null}
		</div>
	);
};

const GlassLabel: React.FC<{
	text?: string;
	x?: number;
	y?: number;
	delay?: number;
}> = ({text = 'Label', x = 0, y = 0, delay = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({
		frame: frame - delay,
		fps,
		config: {damping: 18, stiffness: 90},
		durationInFrames: 22,
	});
	const opacity = interpolate(enter, [0, 1], [0, 1]);
	const translateY = interpolate(enter, [0, 1], [18, 0]);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				padding: '14px 18px',
				borderRadius: 18,
				backdropFilter: 'blur(16px)',
				background: 'rgba(255,255,255,0.72)',
				border: '1px solid rgba(255,255,255,0.75)',
				boxShadow: '0 18px 40px -12px rgba(0,0,0,0.16)',
				fontSize: 20,
				fontWeight: 600,
				color: YT_TEXT,
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			{text}
		</div>
	);
};

const PulseRing: React.FC<{
	x?: number;
	y?: number;
	w?: number;
	h?: number;
	color?: string;
}> = ({x = 0, y = 0, w = 80, h = 80, color = 'rgba(255,0,0,0.45)'}) => {
	const frame = useCurrentFrame();
	const pulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [1, 1.12]);
	const opacity = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.35, 0.75]);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				borderRadius: 999,
				border: `3px solid ${color.replace('0.45', String(opacity))}`,
				boxShadow: `0 0 30px rgba(255,0,0,${opacity * 0.33})`,
				transform: `scale(${pulse})`,
			}}
		/>
	);
};

const YouTubeLogoLockup: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({
		frame: frame - 6,
		fps,
		config: {damping: 15, stiffness: 120},
		durationInFrames: 24,
	});
	const scale = interpolate(enter, [0, 1], [0.7, 1]);
	const rotate = interpolate(enter, [0, 1], [-6, 0]);
	const floatY = Math.sin(frame * 0.04) * 4;
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 28,
				transform: `scale(${scale}) rotate(${rotate}deg) translateY(${floatY}px)`,
			}}
		>
			<div
				style={{
					width: 138,
					height: 98,
					borderRadius: 28,
					background: YT_RED,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					boxShadow: '0 18px 40px -12px rgba(255,0,0,0.3)',
				}}
			>
				<div
					style={{
						width: 0,
						height: 0,
						borderTop: '18px solid transparent',
						borderBottom: '18px solid transparent',
						borderLeft: '32px solid white',
						marginLeft: 6,
					}}
				/>
			</div>
			<WordStagger text="YouTube" start={12} fontSize={110} stagger={3} color={YT_TEXT} />
		</div>
	);
};

const GhostUISilhouettes: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [24, 80], [0, 0.55], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const blur = interpolate(frame, [24, 80], [16, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{opacity, filter: `blur(${blur}px)`}}>
			<div
				style={{
					position: 'absolute',
					left: 220,
					top: 180,
					width: 620,
					height: 360,
					borderRadius: 28,
					background: 'rgba(0,0,0,0.035)',
					boxShadow: '0 30px 60px rgba(0,0,0,0.04)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					right: 160,
					top: 260,
					width: 520,
					height: 260,
					borderRadius: 22,
					background: 'rgba(255,0,0,0.045)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 460,
					bottom: 150,
					width: 840,
					height: 140,
					borderRadius: 24,
					background: 'rgba(0,0,0,0.03)',
				}}
			/>
		</AbsoluteFill>
	);
};

const TopbarButton: React.FC<{
	label?: string;
	icon?: React.ReactNode;
	active?: boolean;
	wide?: boolean;
}> = ({label = '', icon = null, active = false, wide = false}) => {
	return (
		<div
			style={{
				height: 40,
				minWidth: wide ? 124 : 40,
				padding: wide ? '0 16px' : 0,
				borderRadius: 999,
				border: active ? '1px solid rgba(6,95,212,0.22)' : '1px solid rgba(0,0,0,0.06)',
				background: active ? 'rgba(6,95,212,0.08)' : '#fff',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 10,
				fontSize: 16,
				fontWeight: 500,
				color: active ? '#065fd4' : YT_TEXT,
			}}
		>
			{icon}
			{wide ? <span>{label}</span> : null}
		</div>
	);
};

const GuideIcon = () => (
	<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
		<div style={{width: 18, height: 2.5, background: YT_TEXT, borderRadius: 999}} />
		<div style={{width: 18, height: 2.5, background: YT_TEXT, borderRadius: 999}} />
		<div style={{width: 18, height: 2.5, background: YT_TEXT, borderRadius: 999}} />
	</div>
);

const SearchIcon = ({dark = false}: {dark?: boolean}) => (
	<div
		style={{
			width: 18,
			height: 18,
			borderRadius: 999,
			border: `2px solid ${dark ? '#fff' : YT_TEXT}`,
			position: 'relative',
		}}
	>
		<div
			style={{
				position: 'absolute',
				right: -5,
				bottom: -4,
				width: 8,
				height: 2,
				background: dark ? '#fff' : YT_TEXT,
				transform: 'rotate(45deg)',
				borderRadius: 999,
			}}
		/>
	</div>
);

const SettingsIcon = () => (
	<div
		style={{
			width: 18,
			height: 18,
			borderRadius: 999,
			border: '2px solid #0f0f0f',
			position: 'relative',
		}}
	>
		<div
			style={{
				position: 'absolute',
				left: 4,
				top: 4,
				width: 6,
				height: 6,
				borderRadius: 999,
				background: '#0f0f0f',
			}}
		/>
	</div>
);

const PlayIcon = ({size = 18, color = 'white'}: {size?: number; color?: string}) => (
	<div
		style={{
			width: 0,
			height: 0,
			borderTop: `${size / 2}px solid transparent`,
			borderBottom: `${size / 2}px solid transparent`,
			borderLeft: `${size}px solid ${color}`,
			marginLeft: 3,
		}}
	/>
);

const YouTubeHeader: React.FC<{
	focus?: 'top' | 'search' | 'none';
}> = ({focus = 'none'}) => {
	return (
		<div
			style={{
				height: 74,
				display: 'flex',
				alignItems: 'center',
				padding: '0 24px',
				gap: 20,
				borderBottom: '1px solid rgba(0,0,0,0.06)',
				background: '#ffffff',
				position: 'relative',
			}}
		>
			<TopbarButton icon={<GuideIcon />} />
			<div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 170}}>
				<div
					style={{
						width: 34,
						height: 24,
						borderRadius: 8,
						background: YT_RED,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<PlayIcon size={9} />
				</div>
				<div style={{fontSize: 28, fontWeight: 700, color: YT_TEXT}}>YouTube</div>
			</div>
			<div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						width: 760,
						height: 44,
						borderRadius: 999,
						border:
							focus === 'search'
								? '1px solid rgba(6,95,212,0.45)'
								: '1px solid rgba(0,0,0,0.16)',
						boxShadow:
							focus === 'search'
								? '0 0 0 4px rgba(6,95,212,0.1)'
								: 'none',
						background: '#fff',
						display: 'flex',
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							padding: '0 18px',
							fontSize: 16,
							color: '#909090',
						}}
					>
						Search
					</div>
					<div
						style={{
							width: 66,
							borderLeft: '1px solid rgba(0,0,0,0.08)',
							background: focus === 'search' ? '#f7fbff' : '#f8f8f8',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<SearchIcon />
					</div>
				</div>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
				<TopbarButton icon={<SettingsIcon />} />
				<TopbarButton icon={<div style={{width: 16, height: 16, borderRadius: 999, border: '2px solid #065fd4'}} />} label="Sign in" wide active />
			</div>
		</div>
	);
};

const NavRail: React.FC<{
	highlightIndex?: number;
}> = ({highlightIndex = -1}) => {
	const items = [
		'Home',
		'Subscriptions',
		'You',
		'History',
		'Shopping',
		'Music',
		'Movies & TV',
		'YouTube Premium',
		'YouTube TV',
		'YouTube Music',
		'YouTube Kids',
	];
	return (
		<div
			style={{
				width: 258,
				padding: '18px 12px 18px 16px',
				background: 'linear-gradient(180deg, #fff 0%, #fafafa 100%)',
				borderRight: '1px solid rgba(0,0,0,0.05)',
				display: 'flex',
				flexDirection: 'column',
				gap: 6,
			}}
		>
			{items.map((item, i) => {
				const selected = i === highlightIndex || (highlightIndex < 0 && i === 0);
				return (
					<div
						key={item}
						style={{
							height: 48,
							padding: '0 14px',
							borderRadius: 14,
							background: selected ? 'rgba(0,0,0,0.06)' : 'transparent',
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							fontSize: 18,
							fontWeight: selected ? 600 : 400,
							color: YT_TEXT,
							position: 'relative',
						}}
					>
						<div style={{width: 20, height: 20, borderRadius: 6, background: selected ? '#0f0f0f' : '#bdbdbd'}} />
						<div>{item}</div>
						{selected ? (
							<div
								style={{
									position: 'absolute',
									left: -2,
									top: 10,
									bottom: 10,
									width: 4,
									borderRadius: 999,
									background: YT_RED,
								}}
							/>
						) : null}
					</div>
				);
			})}
		</div>
	);
};

const ThumbnailCard: React.FC<{
	title?: string;
	meta?: string;
	large?: boolean;
}> = ({title = 'Thumbnail title', meta = 'Channel • 1M views', large = false}) => {
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
			<div
				style={{
					height: large ? 238 : 162,
					borderRadius: 18,
					background:
						'linear-gradient(135deg, #1a1a1a 0%, #404040 42%, #d52b1e 100%)',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 34%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.09) 0%, transparent 30%)',
					}}
				/>
			</div>
			<div style={{display: 'flex', gap: 10}}>
				<div style={{width: 36, height: 36, borderRadius: 999, background: '#d6d6d6'}} />
				<div style={{display: 'flex', flexDirection: 'column', gap: 7, flex: 1}}>
					<div style={{fontSize: 18, color: YT_TEXT, fontWeight: 500, lineHeight: 1.25}}>{title}</div>
					<div style={{fontSize: 14, color: YT_SUB}}>{meta}</div>
				</div>
			</div>
		</div>
	);
};

const YouTubePageMock: React.FC<{
	focus?: 'none' | 'top' | 'search' | 'player';
	highlightNavIndex?: number;
	playActive?: boolean;
	showPlayerGlow?: boolean;
}> = ({
	focus = 'none',
	highlightNavIndex = 0,
	playActive = false,
	showPlayerGlow = false,
}) => {
	return (
		<div style={{width: 1440, height: 860, background: '#fff', position: 'relative'}}>
			<YouTubeHeader focus={focus === 'search' ? 'search' : focus === 'top' ? 'top' : 'none'} />
			<div style={{display: 'flex', height: 786}}>
				<NavRail highlightIndex={highlightNavIndex} />
				<div style={{flex: 1, padding: 26, display: 'flex', flexDirection: 'column', gap: 22, background: '#fff'}}>
					<div
						style={{
							height: 360,
							borderRadius: 24,
							background: 'linear-gradient(180deg, #151515 0%, #272727 100%)',
							position: 'relative',
							overflow: 'hidden',
							boxShadow: showPlayerGlow
								? '0 0 0 1px rgba(255,255,255,0.1), 0 0 40px rgba(255,0,0,0.18)'
								: 'none',
						}}
					>
						<div
							style={{
								position: 'absolute',
								inset: 0,
								background:
									playActive
										? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,0,0,0.09) 38%, rgba(255,255,255,0) 100%)'
										: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: '50%',
								top: '50%',
								transform: 'translate(-50%, -50%)',
								width: playActive ? 88 : 98,
								height: playActive ? 88 : 98,
								borderRadius: 999,
								background: playActive ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.46)',
								border: '1px solid rgba(255,255,255,0.16)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<PlayIcon size={30} />
						</div>
						<div style={{position: 'absolute', left: 24, right: 24, bottom: 20, height: 42, display: 'flex', alignItems: 'center', gap: 16}}>
							<div style={{width: 22, height: 22, borderRadius: 999, border: '2px solid white', opacity: 0.95}} />
							<div style={{flex: 1}}>
								<div style={{height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.2)', overflow: 'hidden'}}>
									<div
										style={{
											width: playActive ? '38%' : '12%',
											height: '100%',
											background: YT_RED,
											boxShadow: playActive ? '0 0 16px rgba(255,0,0,0.5)' : 'none',
										}}
									/>
								</div>
							</div>
							<div style={{display: 'flex', gap: 12}}>
								{new Array(5).fill(true).map((_, i) => (
									<div key={i} style={{width: 18, height: 18, borderRadius: i === 4 ? 999 : 4, border: '2px solid rgba(255,255,255,0.92)'}} />
								))}
							</div>
						</div>
					</div>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22}}>
						<ThumbnailCard title="Creator spotlight on the homepage" meta="YouTube • Browsing clarity" />
						<ThumbnailCard title="Fast discovery across a familiar layout" meta="Product walkthrough • UI focus" />
						<ThumbnailCard title="Click-driven interaction design" meta="Interface tour • Search • Player" />
					</div>
				</div>
			</div>
		</div>
	);
};

const CardColumn: React.FC<{
	from?: 'left' | 'right' | 'bottom';
	delay?: number;
	index?: number;
}> = ({from = 'left', delay = 0, index = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cards = [0, 1, 2];
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
			{cards.map((card, i) => {
				const enter = spring({
					frame: frame - delay - i * 5,
					fps,
					config: {damping: 18, stiffness: 100},
					durationInFrames: 26,
				});
				const baseX = from === 'left' ? -120 : from === 'right' ? 120 : 0;
				const baseY = from === 'bottom' ? 90 : 0;
				const hover = Math.sin(frame * 0.035 + i + index) * (6 + i * 2);
				return (
					<div
						key={card}
						style={{
							width: 340,
							height: 182,
							borderRadius: 22,
							background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%)',
							border: '1px solid rgba(0,0,0,0.05)',
							boxShadow: '0 18px 40px -12px rgba(0,0,0,0.12)',
							padding: 16,
							opacity: enter,
							transform: `translate(${interpolate(enter, [0, 1], [baseX, 0])}px, ${interpolate(enter, [0, 1], [baseY, 0]) + hover}px) rotate(${from === 'left' ? -3 : from === 'right' ? 3 : 1.5}deg)`,
						}}
					>
						<div style={{height: 104, borderRadius: 16, background: card === 1 ? 'linear-gradient(135deg, #c71e1e 0%, #343434 70%)' : 'linear-gradient(135deg, #5d5d5d 0%, #1f1f1f 70%)'}} />
						<div style={{display: 'flex', gap: 10, marginTop: 12}}>
							<div style={{width: 30, height: 30, borderRadius: 999, background: '#ddd'}} />
							<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
								<div style={{height: 12, width: '78%', borderRadius: 999, background: '#121212'}} />
								<div style={{height: 10, width: '58%', borderRadius: 999, background: '#bcbcbc'}} />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

const Scene1: React.FC<{title?: string}> = ({title = 'YouTube'}) => {
	const frame = useCurrentFrame();
	const bgOpacity = interpolate(frame, [0, 18], [0, 1], {
		extrapolateRight: 'clamp',
	});
	const camera = interpolate(frame, [60, 180], [1, 1.03], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<FullFrame style={{background: '#fff'}}>
			<div style={{opacity: bgOpacity}}>
				<MeshBackground colors={['#ffffff', '#f7f7f7', '#ffe9e9', '#fff3f3']} />
				<RedOrbs count={2} />
				<Particles count={18} tint="#ffd6d6" />
				<LensSweep warm />
				<GhostUISilhouettes />
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						transform: `translate(-50%, -50%) scale(${camera})`,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 32,
					}}
				>
					<YouTubeLogoLockup />
					<div style={{fontSize: 24, color: '#5f5f5f', letterSpacing: 0.2}}>{title}</div>
				</div>
			</div>
			<SceneExit />
		</FullFrame>
	);
};

const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const headlineOpacity = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});
	const shift = interpolate(frame, [90, 150], [0, 20], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const dim = interpolate(frame, [150, 180], [1, 0.8], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#f8f8f8', '#f1f1f1', '#ffe5e5']} cooler />
			<Particles count={12} tint="#ffe0e0" />
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 40%, rgba(255,255,255,0) 100%)', opacity: 0.38}} />
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: `translate(calc(-50% + ${shift}px), -50%)`,
					display: 'flex',
					alignItems: 'center',
					gap: 68,
					opacity: dim,
				}}
			>
				<div style={{transform: 'perspective(1200px) rotateY(10deg) rotateX(2deg)'}}>
					<CardColumn from="left" delay={8} index={0} />
				</div>
				<div style={{transform: 'perspective(1200px) rotateY(0deg) rotateX(2deg)'}}>
					<CardColumn from="bottom" delay={14} index={1} />
				</div>
				<div style={{transform: 'perspective(1200px) rotateY(-10deg) rotateX(2deg)'}}>
					<CardColumn from="right" delay={20} index={2} />
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: 'translate(-50%, -50%)',
					padding: '18px 28px',
					borderRadius: 18,
					background: 'rgba(255,255,255,0.82)',
					backdropFilter: 'blur(14px)',
					border: '1px solid rgba(255,255,255,0.7)',
					boxShadow: '0 18px 40px -12px rgba(0,0,0,0.12)',
					opacity: headlineOpacity,
				}}
			>
				<div style={{fontSize: 42, fontWeight: 700, color: YT_TEXT, letterSpacing: -1}}>Fast feed. Instant clarity.</div>
			</div>
			<SceneExit />
		</FullFrame>
	);
};

const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const enter = spring({frame, fps: FPS, config: {damping: 18, stiffness: 90}, durationInFrames: 26});
	const translateY = interpolate(enter, [0, 1], [100, 0]);
	const scale = interpolate(enter, [0, 1], [0.76, 0.86]);
	const topMask = interpolate(frame, [14, 40], [0.55, 0.04], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const drift = Math.sin(frame * 0.03) * 6;
	const camera = interpolate(frame, [150, 210], [1, 1.04], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#f6f7fb', '#ffe3e3', '#f3f3f3']} cooler />
			<Particles count={10} tint="#ffdada" />
			<LensSweep />
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '53%',
					transform: `translate(-50%, -50%) translateY(${translateY + drift}px) scale(${scale * camera})`,
					width: 1500,
					height: 900,
					perspective: 1200,
				}}
			>
				<div style={{transform: 'rotateX(-6deg) rotateY(10deg)', transformStyle: 'preserve-3d'}}>
					<FloatingBrowser url="youtube.com" width={1500} rotateX={-6} rotateY={10} scale={1}>
						<YouTubePageMock focus="top" highlightNavIndex={0} />
					</FloatingBrowser>
				</div>
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 14%, rgba(255,255,255,${topMask}) 42%, rgba(255,255,255,${topMask + 0.18}) 100%)`, pointerEvents: 'none'}} />
			</div>
			<Cursor
				startDelay={32}
				points={[
					{x: 564, y: 285, frame: 0},
					{x: 648, y: 286, frame: 16},
					{x: 980, y: 286, frame: 36},
					{x: 1348, y: 286, frame: 56},
					{x: 1540, y: 286, frame: 78},
				]}
			/>
			<GlassLabel text="Guide" x={460} y={336} delay={40} />
			<GlassLabel text="Logo" x={640} y={230} delay={44} />
			<GlassLabel text="Search form" x={968} y={226} delay={48} />
			<GlassLabel text="Settings" x={1308} y={228} delay={52} />
			<GlassLabel text="Sign in" x={1530} y={226} delay={56} />
			<SceneExit />
		</FullFrame>
	);
};

const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [0, 18], [1, 1.45], {extrapolateRight: 'clamp'});
	const pullback = interpolate(frame, [150, 190], [1.45, 1.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = frame < 150 ? zoom : pullback;
	const items = ['Home', 'Subscriptions', 'You', 'History', 'Shopping', 'Music', 'Movies & TV', 'YouTube Premium'];
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#f9f9f9', '#f2f2f2', '#ffe8e8']} />
			<Particles count={8} tint="#ffe0e0" />
			<div style={{position: 'absolute', left: '50%', top: '50%', width: 1560, height: 920, transform: `translate(-50%, -50%) scale(${scale})`}}>
				<BrowserFrame url="youtube.com" width={1560} shadow darkMode={false}>
					<YouTubePageMock focus="none" highlightNavIndex={0} />
				</BrowserFrame>
			</div>
			<div style={{position: 'absolute', left: 330, top: 208, width: 320, display: 'flex', flexDirection: 'column', gap: 8}}>
				{items.map((item, i) => {
					const enter = spring({frame: frame - 18 - i * 5, fps: FPS, config: {damping: 18, stiffness: 110}, durationInFrames: 20});
					const opacity = interpolate(enter, [0, 1], [0.4, 1]);
					const x = interpolate(enter, [0, 1], [-10, 0]);
					return (
						<div key={item} style={{height: 52, position: 'relative', opacity, transform: `translateX(${x}px)`}}>
							<div style={{position: 'absolute', inset: 0, borderRadius: 14, background: i === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.55)'}} />
							<div style={{position: 'absolute', left: -6, top: 10, bottom: 10, width: 4, borderRadius: 999, background: `rgba(255,0,0,${0.25 + enter * 0.75})`, boxShadow: '0 0 10px rgba(255,0,0,0.3)'}} />
							<div style={{position: 'absolute', left: 18, top: 14, fontSize: 20, color: YT_TEXT, fontWeight: i === 0 ? 600 : 500}}>{item}</div>
						</div>
					);
				})}
			</div>
			<Cursor
				startDelay={48}
				points={[
					{x: 416, y: 242, frame: 0},
					{x: 420, y: 296, frame: 16},
					{x: 420, y: 350, frame: 32},
					{x: 420, y: 404, frame: 48},
					{x: 420, y: 458, frame: 72},
					{x: 420, y: 512, frame: 90},
					{x: 420, y: 566, frame: 108},
					{x: 420, y: 620, frame: 126},
				]}
			/>
			<div
				style={{
					position: 'absolute',
					right: 200,
					top: 320,
					width: 380,
					padding: '26px 28px',
					borderRadius: 24,
					backdropFilter: 'blur(16px)',
					background: 'rgba(255,255,255,0.68)',
					border: '1px solid rgba(255,255,255,0.9)',
					boxShadow: '0 18px 40px -12px rgba(0,0,0,0.16)',
					opacity: interpolate(frame, [60, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					filter: `blur(${interpolate(frame, [60, 120], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
				}}
			>
				<div style={{fontSize: 18, textTransform: 'uppercase', letterSpacing: 1.5, color: '#7a7a7a'}}>Navigation</div>
				<div style={{fontSize: 52, fontWeight: 700, color: YT_TEXT, marginTop: 10, letterSpacing: -1.5}}>Everything has a place.</div>
				<div style={{fontSize: 20, color: '#5f5f5f', marginTop: 14, lineHeight: 1.45}}>The guide rail turns a dense homepage into a clear, familiar structure.</div>
			</div>
			<SceneExit />
		</FullFrame>
	);
};

const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const browserScale = interpolate(frame, [0, 20], [0.89, 0.93], {extrapolateRight: 'clamp'});
	const darken = interpolate(frame, [20, 50], [0, 0.48], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#f5f5f5', '#ffd7d7', '#ececec']} />
			<Particles count={10} tint="#ffd2d2" />
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 42%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 46%, rgba(0,0,0,0.16) 100%)', opacity: darken}} />
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '54%',
					transform: `translate(-50%, -50%) scale(${browserScale})`,
					width: 1580,
					height: 930,
				}}
			>
				<FloatingBrowser url="youtube.com/watch" width={1580} rotateX={-4} rotateY={6} scale={1}>
					<YouTubePageMock focus="player" highlightNavIndex={0} />
				</FloatingBrowser>
			</div>
			<PulseRing x={922} y={423} w={124} h={124} />
			<Cursor
				startDelay={36}
				points={[
					{x: 1240, y: 318, frame: 0},
					{x: 1160, y: 346, frame: 16},
					{x: 1042, y: 402, frame: 34},
					{x: 983, y: 466, frame: 48},
				]}
			/>
			<SceneExit />
		</FullFrame>
	);
};

const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const tapScale = frame >= 10 && frame <= 16 ? interpolate(frame, [10, 13, 16], [1, 0.92, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
	const viewportBright = interpolate(frame, [12, 36], [0.1, 0.44], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const camera = interpolate(frame, [18, 60], [1.18, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ringScale = interpolate(frame, [10, 22], [0.2, 2.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ringOpacity = interpolate(frame, [10, 22], [0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<FullFrame>
			<MeshBackground colors={['#f7f7f7', '#efefef', '#ffe1e1', '#ffffff']} />
			<Particles count={14} tint="#ffc8c8" />
			<LensSweep warm />
			<div style={{position: 'absolute', left: '50%', top: '52%', width: 1600, height: 950, transform: `translate(-50%, -50%) scale(${camera})`}}>
				<FloatingBrowser url="youtube.com/watch" width={1600} rotateX={-2} rotateY={2} scale={1}>
					<div style={{transform: `scale(${tapScale})`, transformOrigin: '50% 43%'}}>
						<YouTubePageMock playActive showPlayerGlow focus="player" />
					</div>
				</FloatingBrowser>
			</div>
			<Cursor
				points={[
					{x: 962, y: 478, frame: 0},
					{x: 982, y: 458, frame: 10, click: true},
				]}
			/>
			<div
				style={{
					position: 'absolute',
					left: 934,
					top: 410,
					width: 96,
					height: 96,
					borderRadius: 999,
					border: `3px solid rgba(255,80,80,${ringOpacity})`,
					boxShadow: `0 0 28px rgba(255,80,80,${ringOpacity * 0.4})`,
					transform: `scale(${ringScale})`,
				}}
			/>
			<div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 51% 42%, rgba(255,255,255,${viewportBright}) 0%, rgba(255,255,255,0) 38%)`}} />
			{new Array(14).fill(true).map((_, i) => {
				const burst = interpolate(frame, [10, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				const angle = (Math.PI * 2 * i) / 14;
				const distance = 20 + burst * (70 + (i % 3) * 14);
				const x = 982 + Math.cos(angle) * distance;
				const y = 458 + Math.sin(angle) * distance;
				const opacity = interpolate(frame, [12, 44], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return <div key={i} style={{position: 'absolute', left: x, top: y, width: 6, height: 6, borderRadius: 999, background: i % 2 === 0 ? '#ff7a7a' : '#ffffff', opacity, boxShadow: '0 0 12px rgba(255,120,120,0.45)'}} />;
			})}
			<div
				style={{
					position: 'absolute',
					left: 130,
					bottom: 140,
					width: 420,
					padding: '24px 28px',
					borderRadius: 24,
					background: 'rgba(255,255,255,0.75)',
					backdropFilter: 'blur(16px)',
					border: '1px solid rgba(255,255,255,0.86)',
					boxShadow: '0 18px 40px -12px rgba(0,0,0,0.16)',
					opacity: interpolate(frame, [24, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					transform: `translateX(${interpolate(frame, [24, 90], [-40, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
				}}
			>
				<div style={{fontSize: 18, textTransform: 'uppercase', letterSpacing: 1.6, color: '#7b7b7b'}}>Interaction</div>
				<div style={{fontSize: 56, fontWeight: 700, color: YT_TEXT, lineHeight: 1.02, marginTop: 10}}>One click. Locked in.</div>
			</div>
			<SceneExit />
		</FullFrame>
	);
	};

const FeatureCard: React.FC<{
	title?: string;
	body?: string;
	delay?: number;
	y?: number;
}> = ({title = 'Feature', body = 'Description', delay = 0, y = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 100}, durationInFrames: 24});
	const float = Math.sin(frame * 0.03 + delay) * 6;
	return (
		<div
			style={{
				position: 'absolute',
				right: 150,
				top: y,
				width: 420,
				padding: '24px 24px 22px 24px',
				borderRadius: 22,
				background: '#fff',
				border: '1px solid rgba(0,0,0,0.06)',
				boxShadow: '0 18px 40px -12px rgba(0,0,0,0.14)',
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [60, 0]) + float}px) rotate(${interpolate(enter, [0, 1], [3, 0])}deg)`,
			}}
		>
			<div style={{width: 54, height: 54, borderRadius: 18, background: 'linear-gradient(135deg, rgba(255,0,0,0.12) 0%, rgba(255,0,0,0.04) 100%)', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 20, height: 20, borderRadius: 6, background: YT_RED}} />
			</div>
			<div style={{fontSize: 28, fontWeight: 700, color: YT_TEXT}}>{title}</div>
			<div style={{fontSize: 18, lineHeight: 1.45, color: '#5f5f5f', marginTop: 10}}>{body}</div>
		</div>
	);
};

const ConnectorLine: React.FC<{
	fromX?: number;
	fromY?: number;
	toX?: number;
	toY?: number;
	delay?: number;
}> = ({fromX = 0, fromY = 0, toX = 100, toY = 100, delay = 0}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [delay, delay + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const dx = toX - fromX;
	const dy = toY - fromY;
	const length = Math.sqrt(dx * dx + dy * dy);
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
	return (
		<div
			style={{
				position: 'absolute',
				left: fromX,
				top: fromY,
				width: length * progress,
				height: 2,
				background: 'linear-gradient(90deg, rgba(255,0,0,0.6) 0%, rgba(255,0,0,0.14) 100%)',
				transformOrigin: 'left center',
				transform: `rotate(${angle}deg)`,
				borderRadius: 999,
			}}
		/>
	);
};

const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const splitEnter = interpolate(frame, [0, 16], [0.92, 1], {extrapolateRight: 'clamp'});
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#f4f4f4', '#eef2f6', '#ffeaea']} cooler />
			<Particles count={9} tint="#ffe1e1" />
			<div style={{position: 'absolute', right: 220, top: 170, width: 500, height: 500, borderRadius: 999, border: '1px dashed rgba(255,0,0,0.16)', opacity: 0.5}} />
			<div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${splitEnter})`, width: 1660, height: 860, display: 'flex', gap: 54, alignItems: 'center'}}>
				<div style={{flex: 1.2, height: 760}}>
					<BrowserFrame url="youtube.com/watch" width={980} shadow darkMode={false}>
						<YouTubePageMock playActive showPlayerGlow focus="player" />
					</BrowserFrame>
				</div>
				<div style={{position: 'relative', width: 480, height: 760}}>
					<FeatureCard title="Large Play Button" body="A single focal action anchors the hero interaction before playback begins." delay={16} y={110} />
					<FeatureCard title="Searchable Controls" body="Minimal control clusters keep the player recognizable and fast to scan." delay={22} y={330} />
					<FeatureCard title="Overlay Actions" body="Cards, overflow, search, playlist, and unmute live as clear secondary actions." delay={28} y={550} />
				</div>
			</div>
			<ConnectorLine fromX={1020} fromY={420} toX={1388} toY={290} delay={32} />
			<ConnectorLine fromX={1210} fromY={590} toX={1388} toY={510} delay={38} />
			<ConnectorLine fromX={1120} fromY={640} toX={1388} toY={732} delay={44} />
			<Cursor startDelay={60} points={[{x: 1198, y: 642, frame: 0}, {x: 1260, y: 640, frame: 24}, {x: 1320, y: 636, frame: 48}]}/>
			<SceneExit />
		</FullFrame>
	);
};

const Scene8: React.FC = () => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [0, 18], [1, 1.2], {extrapolateRight: 'clamp'});
	const glow = interpolate(frame, [18, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const searchBright = interpolate(frame, [62, 96], [1, 1.06], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const tracking = interpolate(frame, [90, 160], [0, 1.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const caretVisible = Math.floor(frame / 12) % 2 === 0;
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#fafafa', '#f0f3f6', '#ffe6e6']} cooler />
			<Particles count={6} tint="#ffe2e2" />
			<LensSweep warm={false} />
			<div style={{position: 'absolute', left: '50%', top: '51%', transform: `translate(-50%, -50%) scale(${zoom})`, width: 1580, height: 900}}>
				<FloatingBrowser url="youtube.com" width={1580} rotateX={-2} rotateY={3} scale={1}>
					<YouTubePageMock focus="search" highlightNavIndex={0} />
				</FloatingBrowser>
			</div>
			<div style={{position: 'absolute', left: 609, top: 262, width: 780, height: 54, borderRadius: 999, boxShadow: `0 0 0 4px rgba(6,95,212,${0.08 * glow}), 0 0 26px rgba(6,95,212,${0.15 * glow})`, border: `1px solid rgba(6,95,212,${0.42 * glow})`}} />
			<div style={{position: 'absolute', left: 1310, top: 263, width: 68, height: 52, borderRadius: 999, transform: `scale(${searchBright})`, transformOrigin: 'center center'}} />
			<Cursor startDelay={34} points={[{x: 676, y: 289, frame: 0}, {x: 752, y: 289, frame: 28}]} />
			{frame >= 34 ? <div style={{position: 'absolute', left: 756, top: 276, width: 2, height: 24, background: '#0f0f0f', opacity: caretVisible ? 1 : 0}} /> : null}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					bottom: 118,
					transform: 'translateX(-50%)',
					fontSize: 34,
					fontWeight: 500,
					color: '#404040',
					letterSpacing: tracking,
					opacity: interpolate(frame, [90, 160], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
				}}
			>
				Discovery never feels far away.
			</div>
			<SceneExit />
		</FullFrame>
	);
};

const SummaryCard: React.FC<{
	title?: string;
	body?: string;
	delay?: number;
	x?: number;
}> = ({title = 'Familiar', body = 'Description', delay = 0, x = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 100}, durationInFrames: 24});
	const underline = interpolate(frame, [46 + delay, 90 + delay], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = interpolate(Math.sin(frame * 0.08 + delay), [-1, 1], [0.92, 1.08]);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: 312,
				width: 420,
				height: 340,
				padding: '30px 28px',
				borderRadius: 24,
				background: '#fff',
				border: '1px solid rgba(0,0,0,0.06)',
				boxShadow: '0 18px 40px rgba(0,0,0,0.08)',
				opacity: enter,
				transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) rotate(${interpolate(enter, [0, 1], [3, 0])}deg)`,
			}}
		>
			<div style={{width: 56, height: 56, borderRadius: 18, background: 'rgba(255,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pulse})`}}>
				<div style={{width: 16, height: 16, borderRadius: 999, background: YT_RED}} />
			</div>
			<div style={{fontSize: 42, fontWeight: 700, color: YT_TEXT, marginTop: 24, letterSpacing: -1}}>{title}</div>
			<div style={{fontSize: 20, lineHeight: 1.5, color: '#666', marginTop: 14}}>{body}</div>
			<div style={{marginTop: 28, height: 4, width: 160, background: 'rgba(255,0,0,0.08)', borderRadius: 999, overflow: 'hidden'}}>
				<div style={{width: `${underline * 100}%`, height: '100%', background: YT_RED}} />
			</div>
		</div>
	);
};

const Scene9: React.FC = () => {
	const frame = useCurrentFrame();
	const bgOpacity = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
	const widen = interpolate(frame, [120, 180], [1, 0.96], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const prepScale = interpolate(frame, [180, 210], [1, 0.97], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = frame < 180 ? widen : prepScale;
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#f7f7f7', '#ededed', '#ffe4e4']} />
			<Particles count={12} tint="#ffd6d6" />
			<RedOrbs count={2} />
			<div style={{opacity: bgOpacity, filter: 'blur(8px) saturate(0.92)', transform: 'scale(1.04)'}}>
				<div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 1620, height: 920}}>
					<BrowserFrame url="youtube.com" width={1620} shadow darkMode={false}>
						<YouTubePageMock focus="none" highlightNavIndex={0} />
					</BrowserFrame>
				</div>
			</div>
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.3) 100%)'}} />
			<div style={{position: 'absolute', left: '50%', top: '50%', width: 1540, height: 760, transform: `translate(-50%, -50%) scale(${scale})`}}>
				<SummaryCard title="Familiar" body="Recognizable masthead, guide, and player structure make the homepage immediately readable." delay={8} x={40} />
				<SummaryCard title="Fast" body="Search, guide, and playback actions stay visible, direct, and quick to understand." delay={18} x={560} />
				<SummaryCard title="Frictionless" body="One click takes focus. The interface supports it with clean, layered controls." delay={28} x={1080} />
			</div>
			<SceneExit />
		</FullFrame>
	);
};

const MiniBrowser: React.FC = () => {
	const frame = useCurrentFrame();
	const rotateY = interpolate(frame, [30, 70], [14, 6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const opacity = interpolate(frame, [30, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const float = Math.sin(frame * 0.03) * 10;
	return (
		<div
			style={{
				position: 'absolute',
				right: 260,
				top: 220,
				opacity,
				transform: `translateY(${float}px) perspective(1200px) rotateY(${rotateY}deg) rotateX(-4deg)`,
				transformStyle: 'preserve-3d',
			}}
		>
			<BrowserFrame url="youtube.com/watch" width={560} shadow darkMode={false}>
				<div style={{width: 560, height: 320, background: '#fff'}}>
					<div style={{height: 168, background: 'linear-gradient(135deg, #181818 0%, #353535 58%, #b71c1c 100%)', position: 'relative'}}>
						<div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 64, height: 64, borderRadius: 999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<PlayIcon size={20} />
						</div>
					</div>
					<div style={{padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
						<div style={{height: 48, borderRadius: 14, background: '#f1f1f1'}} />
						<div style={{height: 48, borderRadius: 14, background: '#f5f5f5'}} />
					</div>
				</div>
			</BrowserFrame>
		</div>
	);
};

const Scene10: React.FC = () => {
	const frame = useCurrentFrame();
	const line1Opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
	const line2Spring = spring({frame: frame - 12, fps: FPS, config: {damping: 16, stiffness: 100}, durationInFrames: 24});
	const line3Opacity = interpolate(frame, [24, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const shimmer = interpolate(frame, [70, 160], [-120, 130], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const glow = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.2, 0.5]);
	return (
		<FullFrame>
			<MeshBackground colors={['#ffffff', '#fff1f1', '#ffe0e0', '#f8f8f8']} />
			<Particles count={16} tint="#ffd3d3" />
			<RedOrbs count={2} />
			<LensSweep warm />
			<MiniBrowser />
			<div style={{position: 'absolute', left: 220, top: 248, width: 920}}>
				<div style={{fontSize: 56, fontWeight: 500, color: YT_TEXT, opacity: line1Opacity, transform: `translateY(${interpolate(frame, [0, 20], [20, 0], {extrapolateRight: 'clamp'})}px)`}}>Recreate every card.</div>
				<div style={{position: 'relative', marginTop: 16, fontSize: 98, fontWeight: 700, color: YT_TEXT, letterSpacing: -3, transform: `scale(${interpolate(line2Spring, [0, 1], [0.9, 1])})`, transformOrigin: 'left center'}}>
					Make the click the hero.
					<div style={{position: 'absolute', left: `${shimmer}%`, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.86) 50%, rgba(255,255,255,0) 100%)', mixBlendMode: 'screen', opacity: 0.7, transform: 'skewX(-18deg)'}} />
				</div>
				<div style={{fontSize: 30, color: '#5f5f5f', marginTop: 24, opacity: line3Opacity}}>YouTube homepage promo.</div>
				<div style={{marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '18px 28px', borderRadius: 999, background: 'linear-gradient(135deg, #ff2020 0%, #d90000 100%)', color: 'white', fontSize: 22, fontWeight: 700, boxShadow: `0 12px 28px -12px rgba(255,0,0,${glow})`}}>
					<div style={{width: 36, height: 26, borderRadius: 10, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<PlayIcon size={10} />
					</div>
					YouTube
				</div>
			</div>
			<SceneExit />
		</FullFrame>
	);
};

export const YouTubeHomepagePromo: React.FC<YouTubeHomepagePromoProps> = ({
	title = 'YouTube',
	tagline = 'YouTube homepage promo',
	accent = '#FF0000',
	fontFamily = 'Roboto, Arial, sans-serif',
}) => {
	const safeTitle = title ?? 'YouTube';
	const safeTagline = tagline ?? 'YouTube homepage promo';
	const safeAccent = accent ?? '#FF0000';
	const safeFontFamily = fontFamily ?? 'Roboto, Arial, sans-serif';
	void safeTagline;
	void safeAccent;
	void safeFontFamily;
	return (
		<AbsoluteFill style={{backgroundColor: '#ffffff', fontFamily: FONT_FAMILY}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={scene1Duration} premountFor={FPS}>
					<Scene1 title={safeTitle} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={transition1}>
					<LightLeak seed={3} hueShift={8} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={scene2Duration} premountFor={FPS}>
					<Scene2 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transition2})} />
				<TransitionSeries.Sequence durationInFrames={scene3Duration} premountFor={FPS}>
					<Scene3 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: transition3})} />
				<TransitionSeries.Sequence durationInFrames={scene4Duration} premountFor={FPS}>
					<Scene4 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: transition4})} />
				<TransitionSeries.Sequence durationInFrames={scene5Duration} premountFor={FPS}>
					<Scene5 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence durationInFrames={scene6Duration} premountFor={FPS}>
					<Scene6 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transition6})} />
				<TransitionSeries.Sequence durationInFrames={scene7Duration} premountFor={FPS}>
					<Scene7 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={linearTiming({durationInFrames: transition7})} />
				<TransitionSeries.Sequence durationInFrames={scene8Duration} premountFor={FPS}>
					<Scene8 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transition8})} />
				<TransitionSeries.Sequence durationInFrames={scene9Duration} premountFor={FPS}>
					<Scene9 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={transition9}>
					<LightLeak seed={7} hueShift={6} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence durationInFrames={scene10Duration} premountFor={FPS}>
					<Scene10 />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
