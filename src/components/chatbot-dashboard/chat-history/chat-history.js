import React from "react";
import styles from "./chat-history.module.scss";
import { useState, useEffect } from "react";
import { postRequest } from "../../../helper/http-helper";
import { timeAgo } from "../../../helper/utils";
import ReactMarkdown from "react-markdown";
export default function ChatHistory({ botID }) {
	const [history, setHistory] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	useEffect(() => {
		if (botID) {
			postRequest("/fetch_chatbot_history", { botID: botID }).then(
				(response) => {
					const sortedHistory = response.result.sort((a, b) => {
						return new Date(b.last_updated) - new Date(a.last_updated);
					});
					setHistory(sortedHistory);
				},
			);
		}
	}, [botID]);
	const renderers = {
		a: ({ href, children }) => {
			return (
				<a href={href} target="_blank" rel="noopener noreferrer">
					{children}
				</a>
			);
		},
	};
	return (
		<div className={styles.chatHistoryContainer}>
			<div className={styles.chatHistoryList}>
				{history.length > 0 ? (
					history.map((item, index) => (
						<div
							key={item.chat_id}
							className={`${styles.chatHistoryItem} ${
								index === selectedIndex ? styles.selected : ""
							}`}
							onClick={() => setSelectedIndex(index)}
						>
							<p className={styles.chatHistoryItemCust}>
								Customer: {item.history[item.history.length - 2].text}
							</p>
							<p className={styles.chatHistoryItemBot}>
								Bot: {item.history[item.history.length - 1].text}
							</p>
							<p className={styles.chatHistoryLastUpdated}>
								{timeAgo(item.last_updated)}
							</p>
						</div>
					))
				) : (
					<div className="emptyChatView">No chat history available.</div>
				)}
			</div>
			{history.length > 0 && (
				<div className={styles.selectedChat}>
					{history[selectedIndex].history.map((message, index) => (
						<div
							key={index}
							className={`${styles.message} ${
								message.type === "incoming"
									? styles.incomingMessage
									: styles.outgoingMessage
							}`}
						>
							<ReactMarkdown components={renderers}>
								{message.text}
							</ReactMarkdown>
						</div>
					))}
				</div>
			)}
		</div>
	);
}