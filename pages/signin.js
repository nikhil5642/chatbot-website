import React, { useState, useEffect, useContext } from "react";
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	signInWithRedirect,
	OAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
} from "firebase/auth";
import styles from "./styles/signin.module.scss"; // Import the SCSS module
import Image from "next/image";
import { useRouter } from "next/router";
import AuthService from "../src/helper/AuthService";
import LoaderContext from "../src/components/loader/loader-context";
import {
	getCookie,
	removeCookie,
	storeCookie,
} from "../src/helper/cookie-helper";
import { getValue } from "firebase/remote-config";
import { FirebaseFeatures } from "../src/helper/feature-flags";
import { useFirebase } from "../src/helper/firebase-provider";
import { firebaseConfig } from "../src/helper/firebase-provider";
import { initializeApp, getApps } from "firebase/app";
import { showErrorToast, showSuccessToast } from "src/helper/toast-helper";

let app;

try {
	app = initializeApp(firebaseConfig);
} catch (e) {
	// If the app is already initialized, reuse the existing instance
	app = getApps()[0];
}

const SignInPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const auth = getAuth();
	const provider = new GoogleAuthProvider();
	const { showLoader, hideLoader } = useContext(LoaderContext);
	const { isConfigLoaded, remoteConfig } = useFirebase();
	const [featureVisibility, setFeatureVisibility] = useState({
		google: true,
		apple: false,
		email: false,
	});

	useEffect(() => {
		if (isConfigLoaded && remoteConfig) {
			setFeatureVisibility({
				google: getValue(
					remoteConfig,
					FirebaseFeatures.SHOW_GOOGLE_LOGIN,
				).asBoolean(),
				apple: getValue(
					remoteConfig,
					FirebaseFeatures.SHOW_APPLE_LOGIN,
				).asBoolean(),
				email: getValue(
					remoteConfig,
					FirebaseFeatures.SHOW_EMAIL_LOGIN,
				).asBoolean(),
			});
		}
	}, [isConfigLoaded, remoteConfig]);

	useEffect(() => {
		if (getCookie("authInProgress") === "true") {
			showLoader("Logging you in...");
		}

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				showLoader("Logging you in...");
				await user
					.getIdToken()
					.then((token) => {
						hideLoader();
						AuthService.login(token).then(() => router.push("/my-chatbots"));
					})
					.catch(() => {
						hideLoader();
					});
			} else {
				hideLoader();
				showSuccessToast("Signed out successfully!");
			}
		});

		return () => unsubscribe();
	}, []);

	const handleSignInWithGoogle = async () => {
		showLoader("Logging you in...");
		storeCookie("authInProgress", "true");
		try {
			await signInWithRedirect(auth, provider);
		} catch (e) {
			showErrorToast("Error logging you in!");
			hideLoader();
			removeCookie("authInProgress");
		}
	};

	const handleSignInWithApple = async () => {
		const provider = new OAuthProvider("apple.com");
		showLoader("Logging you in...");
		signInWithPopup(auth, provider)
			.then((userCredential) => {
				const user = userCredential.user;
			})
			.catch(() => {
				showErrorToast("Error logging you in!");
			});
	};

	const handleSignInWithEmailAndPassword = async () => {
		showLoader("Logging you in...");
		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				const user = userCredential.user;
			})
			.catch(() => {
				showErrorToast("Error logging you in!");
			});
	};

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h2>Sign In</h2>
				{featureVisibility.google && (
					<button
						className={styles.googleButton}
						onClick={handleSignInWithGoogle}
					>
						<Image
							className={styles.googleIcon}
							src="/assets/google_icon.png"
							alt={"Google"}
							title={"Google"}
							loading="eager"
							height={24}
							width={24}
						></Image>
						<p className={styles.googleText}>Sign in with Google</p>
					</button>
				)}
				{featureVisibility.apple && (
					<button
						className={styles.appleButton}
						onClick={handleSignInWithApple}
					>
						<Image
							className={styles.appleIcon}
							src="/assets/apple_logo.png"
							alt={"Google"}
							title={"Google"}
							loading="eager"
							height={24}
							width={24}
						></Image>
						<p className={styles.googleText}>Sign in with Apple</p>
					</button>
				)}

				<hr className="horizontalLine" />

				{featureVisibility.email && (
					<div>
						<input
							className={styles.input}
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							className={styles.input}
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>

						<button
							className={styles.button}
							onClick={handleSignInWithEmailAndPassword}
						>
							Sign in
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SignInPage;
