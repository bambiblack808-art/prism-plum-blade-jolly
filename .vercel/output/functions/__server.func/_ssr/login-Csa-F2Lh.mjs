import { _ as Link, v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as signIn } from "./client-CVqXY6bk.mjs";
import { t as GROK_PROVIDERS } from "./server-DNXBhf65.mjs";
import { d as Aperture } from "../_libs/lucide-react.mjs";
import { r as useCurrentUserState, t as Button } from "./button-Bq_GepjA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Csa-F2Lh.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	if (!isPending && user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "booth-shell grid min-h-dvh place-items-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-10 w-full max-w-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "booth-frame rounded-xl p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-4 grid size-12 place-items-center rounded-lg bg-secondary text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Aperture, {
									className: "size-6",
									strokeWidth: 1.7
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-semibold tracking-tight",
								children: "Flashframe"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: "Sign in to keep your photo strip private and available on every device."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							className: "h-12 w-full",
							onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
							children: ["Continue with ", provider.label]
						}, provider.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-center text-sm text-muted-foreground",
						children: [
							"Or",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "text-primary underline-offset-4 hover:underline",
								children: "use the booth as a guest"
							})
						]
					})
				]
			})
		})
	});
}
//#endregion
export { Login as component };
