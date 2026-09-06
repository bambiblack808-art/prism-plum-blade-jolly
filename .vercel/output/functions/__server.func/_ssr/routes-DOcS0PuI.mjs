import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { L as string, N as number, P as object } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut } from "./client-CVqXY6bk.mjs";
import { a as hasGateSessionMarker } from "./server-DNXBhf65.mjs";
import { a as ShieldAlert, c as ImageOff, d as Aperture, i as SwitchCamera, l as Download, o as RotateCcw, r as Trash2, s as LoaderCircle, t as X, u as CameraOff } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as cn, i as TooltipTrigger, n as Tooltip, o as createSsrRpc, r as TooltipContent } from "./router-CAmqYDEw.mjs";
import { n as useCurrentUser, r as useCurrentUserState, t as Button } from "./button-Bq_GepjA.mjs";
import { i as getFilter, n as FILTERS, r as authMiddleware, t as DEFAULT_FILTER_ID } from "./filters-CHHjLANA.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DOcS0PuI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function statusFromError(err) {
	const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
	if (name === "NotAllowedError" || name === "SecurityError") return "denied";
	if (name === "NotFoundError" || name === "OverconstrainedError") return "unavailable";
	if (name === "NotReadableError") return "error";
	if (/permission/i.test(String(err))) return "denied";
	return "error";
}
function stopStream(stream) {
	stream?.getTracks().forEach((track) => track.stop());
}
function useCamera(videoRef) {
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [facing, setFacing] = (0, import_react.useState)("user");
	const [canFlip, setCanFlip] = (0, import_react.useState)(false);
	const [errorMessage, setErrorMessage] = (0, import_react.useState)(null);
	const streamRef = (0, import_react.useRef)(null);
	const facingRef = (0, import_react.useRef)("user");
	const attach = (0, import_react.useCallback)(async (stream) => {
		const video = videoRef.current;
		if (!video) return;
		video.srcObject = stream;
		video.muted = true;
		video.playsInline = true;
		try {
			await video.play();
		} catch {}
	}, [videoRef]);
	const refreshDeviceCount = (0, import_react.useCallback)(async () => {
		if (!navigator.mediaDevices?.enumerateDevices) {
			setCanFlip(false);
			return;
		}
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			setCanFlip(devices.filter((d) => d.kind === "videoinput").length > 1);
		} catch {
			setCanFlip(false);
		}
	}, []);
	const start = (0, import_react.useCallback)(async (nextFacing = facingRef.current) => {
		if (!navigator.mediaDevices?.getUserMedia) {
			setStatus("unavailable");
			setErrorMessage("This browser does not support camera access.");
			return;
		}
		setStatus("requesting");
		setErrorMessage(null);
		stopStream(streamRef.current);
		streamRef.current = null;
		const tryConstraints = async (facingMode) => {
			return await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					facingMode: { ideal: facingMode },
					width: { ideal: 1280 },
					height: { ideal: 720 }
				}
			});
		};
		try {
			let stream;
			try {
				stream = await tryConstraints(nextFacing);
			} catch (err) {
				const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
				if (name === "OverconstrainedError" || name === "NotFoundError") {
					stream = await tryConstraints(nextFacing === "user" ? "environment" : "user");
					nextFacing = nextFacing === "user" ? "environment" : "user";
				} else throw err;
			}
			streamRef.current = stream;
			facingRef.current = nextFacing;
			setFacing(nextFacing);
			await attach(stream);
			setStatus("live");
			await refreshDeviceCount();
		} catch (err) {
			stopStream(streamRef.current);
			streamRef.current = null;
			const next = statusFromError(err);
			setStatus(next);
			if (next === "denied") setErrorMessage("Camera permission was blocked. Allow access in site settings, then try again.");
			else if (next === "unavailable") setErrorMessage("No camera was found on this device.");
			else setErrorMessage("The camera could not be started. It may already be in use.");
		}
	}, [attach, refreshDeviceCount]);
	const stop = (0, import_react.useCallback)(() => {
		stopStream(streamRef.current);
		streamRef.current = null;
		const video = videoRef.current;
		if (video) video.srcObject = null;
		setStatus("idle");
		setErrorMessage(null);
	}, [videoRef]);
	const flip = (0, import_react.useCallback)(async () => {
		const next = facingRef.current === "user" ? "environment" : "user";
		await start(next);
	}, [start]);
	(0, import_react.useEffect)(() => {
		return () => {
			stopStream(streamRef.current);
			streamRef.current = null;
		};
	}, []);
	return {
		status,
		facing,
		canFlip,
		errorMessage,
		start,
		stop,
		flip,
		isMirrored: facing === "user"
	};
}
var MAX_EDGE = 720;
var JPEG_QUALITY = .72;
function captureFrame(video, cssFilter, mirrored) {
	const width = video.videoWidth;
	const height = video.videoHeight;
	if (!width || !height) return null;
	const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
	const cw = Math.max(1, Math.round(width * scale));
	const ch = Math.max(1, Math.round(height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = cw;
	canvas.height = ch;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	ctx.filter = cssFilter === "none" ? "none" : cssFilter;
	if (mirrored) {
		ctx.translate(cw, 0);
		ctx.scale(-1, 1);
	}
	ctx.drawImage(video, 0, 0, cw, ch);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.filter = "none";
	return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
function downloadDataUrl(dataUrl, filename) {
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
}
function shotFilename(filterId) {
	return `flashframe-${filterId}-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19)}.jpg`;
}
var MAX_IMAGE_CHARS = 18e5;
var listShots = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("055e8c906866889262896113da5f2b9a35a1f70e17bb6794849d7d4e93480a83"));
var saveShot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	imageData: string().min(32).max(MAX_IMAGE_CHARS).refine((v) => v.startsWith("data:image/jpeg;base64,"), "Must be a JPEG data URL"),
	filterId: string().max(32)
})).handler(createSsrRpc("67c03c63109ddf99fd5693d3d270e81cdf514ffe43a3c0d377cac373e03f5251"));
var deleteShot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number().int().positive() })).handler(createSsrRpc("a8bd0e2cdf4b5e717008bc5c023d7e5f135adbebdce687151463879d2316b3e7"));
var badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-secondary text-secondary-foreground",
		outline: "border-border text-muted-foreground",
		live: "border-transparent bg-live/15 text-live"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var STATUS_COPY = {
	idle: {
		title: "Camera off",
		body: "Open the camera to step into the booth.",
		tone: "idle"
	},
	requesting: {
		title: "Asking for camera",
		body: "Approve the browser prompt to continue.",
		tone: "warn"
	},
	live: {
		title: "Live",
		body: "Look into the lens. The shutter waits for you.",
		tone: "live"
	},
	denied: {
		title: "Permission blocked",
		body: "Allow camera access in site settings, then try again.",
		tone: "error"
	},
	unavailable: {
		title: "No camera found",
		body: "Plug in a webcam or use a device with a camera.",
		tone: "error"
	},
	error: {
		title: "Camera busy",
		body: "Close other apps using the camera, then retry.",
		tone: "error"
	}
};
function Viewfinder({ videoRef, status, facing, isMirrored, filterCss, filterLabel, errorMessage, mode, count, capturedUrl, onEnable }) {
	const copy = STATUS_COPY[status];
	const showVideo = status === "live" || status === "requesting";
	const showStill = mode === "review" && capturedUrl;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "booth-frame rounded-xl p-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "viewfinder aspect-[4/3] rounded-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					className: cn("viewfinder-video", isMirrored && "is-mirrored", (!showVideo || showStill) && "invisible absolute"),
					style: { filter: filterCss },
					playsInline: true,
					muted: true,
					autoPlay: true,
					"aria-label": "Live camera preview"
				}),
				showStill ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: capturedUrl,
					alt: "Captured snapshot",
					className: "viewfinder-still"
				}) : null,
				status !== "live" && !showStill ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyStage, {
					status,
					copy,
					errorMessage,
					onEnable
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "viewfinder-vignette" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "viewfinder-corners",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
				}),
				mode === "counting" && count !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 z-10 grid place-items-center bg-background/25",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "countdown-num tabular-nums",
						"aria-live": "assertive",
						children: count
					}, count)
				}) : null,
				mode === "flash" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "booth-flash" }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: copy.tone === "live" ? "live" : "default",
						className: "pointer-events-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("status-dot", copy.tone === "idle" && "is-idle", copy.tone === "warn" && "is-warn", copy.tone === "error" && "is-error", copy.tone === "live" && "live-pulse") }), status === "live" ? "Live" : copy.title]
					}), status === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "bg-background/40 backdrop-blur-sm",
						children: [
							facing === "user" ? "Front" : "Rear",
							" · ",
							filterLabel
						]
					}) : null]
				})
			]
		})
	});
}
function EmptyStage({ status, copy, errorMessage, onEnable }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "curtain absolute inset-0 grid place-items-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex max-w-sm flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-4 grid size-14 place-items-center rounded-full bg-background/55 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(status === "denied" ? ShieldAlert : status === "requesting" ? LoaderCircle : status === "idle" ? Aperture : CameraOff, {
						className: cn("size-6", status === "requesting" && "animate-spin"),
						strokeWidth: 1.6
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-semibold tracking-tight",
					children: copy.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-primary/85",
					children: errorMessage ?? copy.body
				}),
				status !== "requesting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5",
					onClick: onEnable,
					children: status === "idle" ? "Open camera" : "Try again"
				}) : null
			]
		})
	});
}
function FilterRail({ activeId, disabled, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
				children: "Filters"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Tap a look before you shoot"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
			role: "listbox",
			"aria-label": "Filter presets",
			children: FILTERS.map((filter) => {
				const active = filter.id === activeId;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "option",
					"aria-selected": active,
					disabled,
					onClick: () => onChange(filter.id),
					className: cn("h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-[background-color,color,border-color,transform] duration-150 ease-out active:not-disabled:scale-[0.96]", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-secondary"),
					children: filter.label
				}, filter.id);
			})
		})]
	});
}
function ShutterBar({ canCapture, canFlip, isReview, capturing, onCapture, onFlip, onDownload, onRetake, onCloseCamera, cameraLive }) {
	if (isReview) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			onClick: onRetake,
			className: "min-w-32",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), "Retake"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: onDownload,
			className: "min-w-32",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download"]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[1fr_auto_1fr] items-center gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: canFlip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						"aria-label": "Flip camera",
						onClick: onFlip,
						disabled: !cameraLive || capturing,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Flip camera" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: cn("shutter-btn"),
				"aria-label": "Take photo",
				disabled: !canCapture,
				onClick: onCapture
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-start",
				children: cameraLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						"aria-label": "Close camera",
						onClick: onCloseCamera,
						disabled: capturing,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Close camera" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			})
		]
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-background/80 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[min(100%-1.5rem,34rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-border", "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-lg font-semibold tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function GalleryStrip({ shots, signedIn, onDelete }) {
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const active = shots.find((s) => s.id === openId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3 px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold tracking-tight",
					children: "Your strip"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: signedIn ? "Saved to your account — available on any device." : "Local for this visit. Sign in to keep shots across devices."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs tabular-nums text-muted-foreground",
					children: [shots.length, "/24"]
				})]
			}),
			shots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-4 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No frames yet. Open the camera and hit the shutter."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				children: shots.map((shot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "polaroid w-28 shrink-0 rounded-md p-1.5 text-left",
					onClick: () => setOpenId(shot.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: shot.imageData,
						alt: "",
						className: "aspect-[4/3] w-full rounded-sm object-cover outline outline-1 -outline-offset-1 outline-black/10"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 truncate px-0.5 text-xs font-medium tracking-wide",
						children: getFilter(shot.filterId).label
					})]
				}, shot.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: active !== null,
				onOpenChange: (open) => !open && setOpenId(null),
				children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: getFilter(active.filterId).label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: formatDistanceToNow(new Date(active.createdAt), { addSuffix: true }) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: active.imageData,
						alt: `${getFilter(active.filterId).label} snapshot`,
						className: "w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-white/10"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							onClick: () => downloadDataUrl(active.imageData, shotFilename(active.filterId)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "flex-1",
							onClick: () => {
								onDelete(active.id);
								setOpenId(null);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Remove"]
						})]
					})
				] }) : null
			})
		]
	});
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-secondary", className),
		...props
	});
}
function AuthSlot() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-36 rounded-full" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "auth-chip flex min-h-11 max-w-[min(100%,18rem)] items-center rounded-full border border-border bg-card px-3 py-1 text-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "outline",
		size: "sm",
		className: "rounded-full px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			children: "Sign in"
		})
	});
}
function BoothHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "relative z-10 flex items-center justify-between gap-3 px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 place-items-center rounded-lg bg-secondary text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Aperture, {
					className: "size-5",
					strokeWidth: 1.75
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg leading-tight font-semibold tracking-tight",
					children: "Flashframe"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Private photo booth"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})]
	});
}
var localShotSeq = -1;
function PhotoBooth() {
	const videoRef = (0, import_react.useRef)(null);
	const camera = useCamera(videoRef);
	const { user, isPending } = useCurrentUserState();
	const signedIn = Boolean(user);
	const queryClient = useQueryClient();
	const [filterId, setFilterId] = (0, import_react.useState)(DEFAULT_FILTER_ID);
	const [mode, setMode] = (0, import_react.useState)("preview");
	const [count, setCount] = (0, import_react.useState)(null);
	const [capturedUrl, setCapturedUrl] = (0, import_react.useState)(null);
	const [guestShots, setGuestShots] = (0, import_react.useState)([]);
	const timers = (0, import_react.useRef)([]);
	const filter = getFilter(filterId);
	const capturing = mode === "counting" || mode === "flash";
	const shotsQuery = useQuery({
		queryKey: ["shots"],
		queryFn: () => listShots(),
		enabled: signedIn && !isPending,
		retry: false
	});
	const shots = signedIn ? shotsQuery.data ?? [] : guestShots;
	const saveMutation = useMutation({
		mutationFn: (input) => saveShot({ data: input }),
		onSuccess: (saved) => {
			queryClient.setQueryData(["shots"], (prev) => {
				return [saved, ...prev ?? []].slice(0, 24);
			});
		},
		onError: (err) => {
			if ((err instanceof Error ? err.message : "Could not save") === "Unauthorized") toast.error("Session expired. Sign in to keep this shot.");
			else toast.error("Could not save this shot to your account.");
		}
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => deleteShot({ data: { id } }),
		onSuccess: (_ok, id) => {
			queryClient.setQueryData(["shots"], (prev) => (prev ?? []).filter((s) => s.id !== id));
		},
		onError: () => toast.error("Could not remove that shot.")
	});
	const clearTimers = (0, import_react.useCallback)(() => {
		timers.current.forEach((id) => window.clearTimeout(id));
		timers.current = [];
	}, []);
	(0, import_react.useEffect)(() => () => clearTimers(), [clearTimers]);
	const takeShot = (0, import_react.useCallback)(() => {
		const video = videoRef.current;
		if (!video) return;
		const dataUrl = captureFrame(video, filter.css, camera.isMirrored);
		if (!dataUrl) {
			toast.error("Nothing to capture yet — wait for the live preview.");
			setMode("preview");
			setCount(null);
			return;
		}
		setCapturedUrl(dataUrl);
		setMode("flash");
		const flashTimer = window.setTimeout(() => {
			setMode("review");
			setCount(null);
		}, 280);
		timers.current.push(flashTimer);
		if (signedIn) saveMutation.mutate({
			imageData: dataUrl,
			filterId: filter.id
		});
		else {
			const guest = {
				id: localShotSeq--,
				filterId: filter.id,
				imageData: dataUrl,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			setGuestShots((prev) => [guest, ...prev].slice(0, 24));
		}
	}, [
		camera.isMirrored,
		filter.css,
		filter.id,
		saveMutation,
		signedIn
	]);
	const startCountdown = (0, import_react.useCallback)(() => {
		if (camera.status !== "live" || capturing) return;
		clearTimers();
		setCapturedUrl(null);
		setMode("counting");
		setCount(3);
		const id2 = window.setTimeout(() => setCount(2), 900);
		const id1 = window.setTimeout(() => setCount(1), 1800);
		const shoot = window.setTimeout(() => takeShot(), 2700);
		timers.current.push(id2, id1, shoot);
	}, [
		camera.status,
		capturing,
		clearTimers,
		takeShot
	]);
	const retake = (0, import_react.useCallback)(() => {
		clearTimers();
		setCapturedUrl(null);
		setCount(null);
		setMode("preview");
	}, [clearTimers]);
	const downloadCurrent = (0, import_react.useCallback)(() => {
		if (!capturedUrl) return;
		downloadDataUrl(capturedUrl, shotFilename(filter.id));
		toast.success("Photo downloaded");
	}, [capturedUrl, filter.id]);
	const handleDelete = (0, import_react.useCallback)((id) => {
		if (id < 0) {
			setGuestShots((prev) => prev.filter((s) => s.id !== id));
			return;
		}
		deleteMutation.mutate(id);
	}, [deleteMutation]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.code !== "Space") return;
			const tag = event.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;
			if (camera.status !== "live" || mode !== "preview") return;
			event.preventDefault();
			startCountdown();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		camera.status,
		mode,
		startCountdown
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "booth-shell",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoothHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewfinder, {
					videoRef,
					status: camera.status,
					facing: camera.facing,
					isMirrored: camera.isMirrored,
					filterCss: filter.css,
					filterLabel: filter.label,
					errorMessage: camera.errorMessage,
					mode,
					count,
					capturedUrl,
					onEnable: () => {
						retake();
						camera.start("user");
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterRail, {
					activeId: filterId,
					disabled: capturing,
					onChange: setFilterId
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShutterBar, {
					canCapture: camera.status === "live" && mode === "preview",
					canFlip: camera.canFlip,
					isReview: mode === "review",
					capturing,
					cameraLive: camera.status === "live",
					onCapture: startCountdown,
					onFlip: () => void camera.flip(),
					onDownload: downloadCurrent,
					onRetake: retake,
					onCloseCamera: () => {
						retake();
						camera.stop();
					}
				}),
				!signedIn && !isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-sm text-muted-foreground",
					children: [
						"Snap freely —",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "text-primary underline-offset-4 hover:underline",
							children: "sign in"
						}),
						" ",
						"to keep your strip across devices."
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryStrip, {
					shots,
					signedIn,
					onDelete: handleDelete
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoBooth, {});
}
//#endregion
export { Home as component };
