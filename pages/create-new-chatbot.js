import ChatBotEditor from "../src/components/chatbot-editor/chatbot-editor";
import styles from "./styles/defaults.module.scss";
import Head from "next/head";

export default function HomeScreen() {
	return (
		<>
			<Head>
				<title>Home</title>
				<meta name="My Chatbots" content="List of already trained chatbots" />
				<link rel="canonical" href="https://chessmeito.com/my-chatbots" />
			</Head>
			<div className={styles.container}>
				<ChatBotEditor />
			</div>
		</>
	);
}
