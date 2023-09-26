import styles from "./website-loader.module.scss";
import { useState, useEffect } from "react";
import URLEditBoxComponent from "../../url-editbox-component/url-editbox-component";
import { postRequest } from "../../../helper/http-helper";
import { generateRandomString } from "../chatbot-source-editor.utits";
import LoadingButton from "src/components/loading-button/loading-button";
import { useTrackEvent } from "src/helper/event-tracker";
import { URLStatus, URLStatusText } from "./website-loader.utils";

export default function WebisteLoader({ bot_id, data, setData }) {
	const { trackEvent } = useTrackEvent();
	const [url, setUrl] = useState("");
	const [loader, setLoader] = useState({
		fetchLinks: false,
	});
	const fetchUrls = () => {
		setLoader((val) => ({ ...val, fetchLinks: true }));
		postRequest("/fetch_urls", { url: url, botID: bot_id }, {}, 10000000)
			.then((res) => {
				setData([...data, ...res.result]);
				setLoader((val) => ({ ...val, fetchLinks: false }));
				trackEvent("urls_fetched", { botID: bot_id, url: url });
			})
			.catch(() => {
				setLoader((val) => ({ ...val, fetchLinks: false }));
				trackEvent("urls_fetch_failure", { botID: bot_id, url: url });
			});
	};
	const addURL = () => {
		setData([
			...data,
			{
				content_id: generateRandomString(10),
				source: "",
				source_type: "url",
				char_count: 0,
				last_updated: "",
				status: URLStatus.NewlyAdded,
			},
		]);
		trackEvent("url_added", { botID: bot_id });
	};
	const handleDeleteCancel = (id) => {
		const updatedData = data.map((item) =>
			item.content_id === id
				? { ...item, status: URLStatus.NewlyAdded }
				: { ...item },
		);
		setData(updatedData);
	};
	const handleDeleteUrl = (id) => {
		const updatedData = data.map((item) =>
			item.content_id === id
				? { ...item, status: URLStatus.Removing }
				: { ...item },
		);
		setData(updatedData);
	};

	const handleEditUrl = (id, newSource) => {
		const updatedData = data.map((item) =>
			item.content_id === id
				? { ...item, source: newSource, status: URLStatus.NewlyAdded }
				: { ...item },
		);
		setData(updatedData);
	};

	return (
		<div className={styles.container}>
			<h4>Crawl</h4>

			<div className={styles.urlCrawlerView}>
				<div className={styles.fetchLinksInput}>
					<URLEditBoxComponent
						placeholder={"https://www.example.com"}
						value={url}
						onChange={(value) => setUrl(value)}
					/>
				</div>

				<div className={styles.fetchLinksButton}>
					<LoadingButton
						title={"Fetch Links"}
						onClick={fetchUrls}
						isLoading={loader.fetchLinks}
					/>
				</div>
			</div>
			<p className={styles.urlCrawlerDesc}>
				This will crawl all the links starting with the URL (not including files
				on the website).
			</p>
			<ul>
				{data
					.filter((item) => item.source_type === "url")
					.map((item) => (
						<li key={item.content_id} className={styles.urlItem}>
							<StatusItem item={item} />
							<URLEditBoxComponent
								placeholder={"https://www.example.com"}
								value={item.source}
								onChange={(value) => handleEditUrl(item.content_id, value)}
							/>
							{item.char_count > 0 && (
								<p className={styles.urlCharCount}>{item.char_count}</p>
							)}
							<button
								onClick={() => {
									item.status == URLStatus.Removing
										? handleDeleteCancel(item.content_id)
										: handleDeleteUrl(item.content_id);
								}}
								className={styles.urlItemButton}
							>
								{item.status == URLStatus.Removing ? (
									<img
										className={styles.closeURLItem}
										src="/assets/close.png"
										alt="Close"
									/>
								) : (
									<img
										className={styles.deleteURLItem}
										src="/assets/bin.png"
										alt="Delete"
									/>
								)}
							</button>
						</li>
					))}
			</ul>
			<p className={styles.charDetected}>
				{data
					.filter((item) => item.source_type === "url")
					.reduce((acc, curr) => acc + curr.char_count, 0)}
				{"  "}
				Char Detected
			</p>

			<div className={styles.addURLContainer}>
				<LoadingButton title={"Add URL"} onClick={addURL} />
			</div>
		</div>
	);
}

function StatusItem({ item }) {
	return (
		(item.status === URLStatus.Trained ||
			item.status === URLStatus.Removing) && (
			<p className={`${styles.statusLabel} ${styles[item.status]}`}>
				{URLStatusText[item.status]}
			</p>
		)
	);
}
