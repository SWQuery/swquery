/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { getCookie, setCookie } from "cookies-next/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ChatModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
	const [openAIKey, setOpenAIKey] = useState("");
	const [heliusKey, setHeliusKey] = useState("");
	const [isOpenAIValid, setIsOpenAIValid] = useState(true);
	const [isHeliusValid, setIsHeliusValid] = useState(true);
	const [heliusVisible, setHeliusVisible] = useState(false);
	const [openAiVisible, setOpenAiVisible] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const openai_key = getCookie("openai_key");
		const helius_key = getCookie("helius_key");
		if (openai_key && helius_key) {
			setOpenAIKey(openai_key);
			setHeliusKey(helius_key);
		}
	}, []);

	useEffect(() => {
		if (isOpen && openAIKey !== "" && heliusKey !== "") {
			toast.success(
				"Keys found in cookies, you can either change them or proceed.",
				{
					duration: 3000,
					style: {
						background: "#18181B",
						color: "#FFFFFF",
						border: "0.5px solid #9C88FF",
					},
				}
			);
		}
	}, [isOpen, openAIKey, heliusKey]);

	const validateOpenAIKey = (value: string) => {
		const pattern = /^sk-proj-/;
		return pattern.test(value);
	};

	const validateHeliusKey = (value: string) => {
		const pattern =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		return pattern.test(value);
	};

	const handleOpenAIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setOpenAIKey(value);
		setIsOpenAIValid(value === "" || validateOpenAIKey(value));
	};

	const setCookies = () => {
		try {
			setCookie("openai_key", openAIKey, {
				maxAge: 60 * 60 * 24 * 30,
			});

			setCookie("helius_key", heliusKey, {
				maxAge: 60 * 60 * 24 * 30,
			});

			// Check if the keys are properly set and redirect to the chatbot page
			const openai_key = getCookie("openai_key");
			const helius_key = getCookie("helius_key");
			if (openai_key && helius_key) {
				router.push("/chatbot");
			}
		} catch (error) {
			// console.logerror(error);
			toast.error("An error occurred while setting up the keys.");
		}
	};

	const formatHeliusKey = (value: string) => {
		const cleaned = value.replace(/[^0-9a-f]/gi, "");

		let formatted = "";
		for (let i = 0; i < cleaned.length && i < 32; i++) {
			if (i === 8 || i === 12 || i === 16 || i === 20) {
				formatted += "-";
			}
			formatted += cleaned[i];
		}

		return formatted;
	};

	const handleHeliusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formattedValue = formatHeliusKey(value);
		setHeliusKey(formattedValue);
		setIsHeliusValid(
			formattedValue === "" || validateHeliusKey(formattedValue)
		);
	};

	const changeVisibility = (key: string) => {
		if (key === "helius") {
			setHeliusVisible(!heliusVisible);
		} else {
			setOpenAiVisible(!openAiVisible);
		}
	};

	const isFormValid =
		validateOpenAIKey(openAIKey) && validateHeliusKey(heliusKey);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-black border border-purple-500/20 p-8 rounded-xl shadow-lg relative w-full mx-4 md:mx-0 md:w-1/4 lg:w-1/2 max-w-4xl">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
				>
					<X size={24} />
				</button>

				<h2 className="text-3xl font-semibold text-white mb-8">
					Enter API Keys
				</h2>

				<div className="space-y-6">
					<div className="space-y-2">
						<div className="w-full relative">
							<label className="text-white text-sm">
								OpenAI Key
							</label>
							<input
								type={openAiVisible ? "text" : "password"}
								placeholder="sk-proj-..."
								value={openAIKey}
								onChange={handleOpenAIChange}
								className={`w-full bg-gray-900/50 border ${
									isOpenAIValid
										? "border-purple-500/20"
										: "border-red-500"
								} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500 pr-12`}
							/>

							<button
								className="transparent absolute right-4 top-10"
								onClick={() => changeVisibility("openAi")}
							>
								{openAiVisible ? (
									<EyeOff size={18} />
								) : (
									<Eye size={18} />
								)}
							</button>
						</div>

						{!isOpenAIValid && (
							<p className="text-red-500 text-sm mt-1">
								Key must be an OpenAi key
							</p>
						)}
					</div>

					<div className="space-y-2">
						<div className="w-full relative">
							<label className="text-white text-sm">
								Helius Key
							</label>
							<input
								type={heliusVisible ? "text" : "password"}
								placeholder="00000000-0000-0000-0000-000000000000"
								value={heliusKey}
								onChange={handleHeliusChange}
								maxLength={36}
								className={`w-full bg-gray-900/50 border ${
									isHeliusValid
										? "border-purple-500/20"
										: "border-red-500"
								} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500 pr-12`}
							/>
							<button
								className="transparent absolute right-4 top-10"
								onClick={() => changeVisibility("helius")}
							>
								{heliusVisible ? (
									<EyeOff size={18} />
								) : (
									<Eye size={18} />
								)}
							</button>
						</div>

						{!isHeliusValid && heliusKey !== "" && (
							<p className="text-red-500 text-sm mt-1">
								Key must be an HeliusRPC key
							</p>
						)}
					</div>

					<button
						className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg transition-all mt-6 font-medium ${
							!isFormValid
								? "opacity-50 cursor-not-allowed"
								: "hover:opacity-90"
						}`}
						disabled={!isFormValid}
						onClick={setCookies}
					>
						Go chat 🚀
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChatModal;
