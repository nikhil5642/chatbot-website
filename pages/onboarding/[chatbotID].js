import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { postRequest } from "../../src/helper/http-helper";
import LoaderContext from "../../src/components/loader/loader-context";
import { useTrackEvent } from "../../src/helper/event-tracker";
import WebisteLoader from "../../src/components/chatbot-source-editor/website-loader/website-loader";
import TextLoader from "../../src/components/chatbot-source-editor/text-loader/text-loader";
import styles from "../styles/onboarding.module.scss";
import TrainComponent from "../../src/components/chatbot-source-editor/train-component/train-component";
function OnboardingPage() {
	const { chatbotID } = useRouter().query;
	const { trackEvent } = useTrackEvent();
	const [data, setData] = useState([]);
	const [chatbotData, setChatbotData] = useState({
		id: "",
	});
	const [step, setStep] = useState(STEPS.ADD_URL);
	const { showLoader, hideLoader } = useContext(LoaderContext);
	useEffect(() => {
		if (chatbotID) {
			setChatbotData({ id: chatbotID });
			loadChatBotData(chatbotID);
		}
	}, [chatbotID]);

	const loadChatBotData = (chatbotID) => {
		if (chatbotID) {
			showLoader("Loading Content");
			postRequest("/load_chatbot_content", { botID: chatbotID })
				.then((res) => {
					hideLoader();
					trackEvent("chatbot-onboarding-load-content-success");
					setData(res.result);
				})
				.catch(() => {
					hideLoader();
					trackEvent("chatbot-onboarding-load-content-failed");
				});
		}
	};
	function handleNext() {
		if (step === STEPS.ADD_URL) {
			setStep(STEPS.ADD_TEXT); // Replace NEXT_STEP with your actual next step
		} else {
			setStep(STEPS.TRAIN);
		}
	}

	function handlePrev() {
		if (step === STEPS.TRAIN) {
			setStep(STEPS.ADD_TEXT); // Replace NEXT_STEP with your actual next step
		} else {
			setStep(STEPS.ADD_URL);
		}
	}

	return (
		<div className={styles.onBoardingContainer}>
			<h1>{step.title}</h1>
			<p>{step.desc}</p>
			<div className={styles.stepContainer}>
				{step === STEPS.ADD_URL && (
					<WebisteLoader
						bot_id={chatbotData.id}
						data={data}
						setData={setData}
						chatbotInfoData={chatbotData}
						setChatbotInfoData={setChatbotData}
					/>
				)}
				{step === STEPS.ADD_TEXT && (
					<TextLoader
						bot_id={chatbotData.id}
						data={data}
						setData={setData}
						chatbotInfoData={chatbotData}
						setChatbotInfoData={setChatbotData}
					></TextLoader>
				)}
				{step == STEPS.TRAIN && (
					<TrainComponent
						data={data}
						chatbotInfoData={chatbotData}
						setChatbotInfoData={setChatbotData}
					/>
				)}
			</div>
			<div className={styles.buttonContainer}>
				{step !== STEPS.ADD_URL && <button onClick={handlePrev}>Prev</button>}
				{step !== STEPS.TRAIN && <button onClick={handleNext}>Next</button>}
			</div>
		</div>
	);
}

const STEPS = {
	ADD_URL: {
		id: 1,
		title: "Let's start by adding link of your website",
		desc: "Skip this step in case you don't have a Website",
	},
	ADD_TEXT: {
		id: 2,
		title: "Add text to your chatbot",
		desc: "Skip this step in case you don't have any additoinal text to add",
	},
	TRAIN: {
		id: 3,
		title: "Finally, Train your chatbot!",
		desc: "Click on Train button to train the chatbot on your own data!",
	},
};

OnboardingPage.showHeaderFooter = false;
export default OnboardingPage;
