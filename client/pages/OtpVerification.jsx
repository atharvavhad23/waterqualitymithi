
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const WaveLogo = (props) => (
		<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
				<path d="M62 60H2C2 60 14 38 32 38C50 38 62 60 62 60Z" fill="#60A5FA"/>
				<path d="M54 36C54 36 50 22 32 22C14 22 10 36 10 36" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
				<circle cx="42" cy="18" r="6" fill="#BFDBFE"/>
				<circle cx="34" cy="16" r="8" fill="#DBEAFE"/>
				<circle cx="26" cy="19" r="5" fill="#EFF6FF"/>
		</svg>
);

export default function OtpVerification() {
	const [otp, setOtp] = React.useState(new Array(6).fill(""));
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");
	const [success, setSuccess] = React.useState(false);
	const inputRefs = React.useRef([]);
	const location = useLocation();
	const navigate = useNavigate();
	const userEmail = location.state?.email || "";
	const formData = location.state?.formData;

	const handleChange = (element, index) => {
		const value = element.value;
		if (isNaN(value)) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);
		setError("");
		if (value && element.nextSibling) {
			element.nextSibling.focus();
		}
	};

	const handleKeyDown = (e, index) => {
		if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
			e.target.previousSibling.focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		const enteredOtp = otp.join("");
		if (enteredOtp.length !== 6) {
			setError("Please enter the complete 6-digit code.");
			setLoading(false);
			return;
		}
		try {
			// Step 1: Verify OTP
			const verifyResponse = await fetch('/api/verify-otp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: userEmail, code: enteredOtp }),
			});
			const verifyData = await verifyResponse.json();
			if (verifyResponse.ok && verifyData.success) {
				// Step 2: Create user
			const signupResponse = await fetch('/api/signup/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: formData?.firstName + ' ' + formData?.lastName,
						email: userEmail,
						phone: formData?.phone || '',
						password: formData?.password
					}),
				});
				const signupData = await signupResponse.json();
				if (signupResponse.ok && signupData.success) {
					const username = signupData.username || userEmail.split('@')[0];
					toast.success(`Verification successful! You can now login with email: ${userEmail} or username: ${username}`);
					setSuccess(true);
					setTimeout(() => {
						navigate('/login', { 
							state: { 
								registeredEmail: userEmail,
								registeredUsername: username,
								message: `Welcome! Login with your email (${userEmail}) or username (${username})`
							} 
						});
					}, 2000);
				} else {
					setError(signupData.error || "Account creation failed.");
					toast.error(signupData.error || "Account creation failed.");
				}
			} else {
				setError(verifyData.message || "Invalid OTP. Please try again.");
				toast.error(verifyData.message || "Invalid OTP. Please try again.");
			}
		} catch (error) {
			setError("Connection error. Please try again.");
			toast.error("Connection error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		try {
			const resendResponse = await fetch('/api/send-signup-otp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: userEmail }),
			});
			const resendData = await resendResponse.json();
			if (resendResponse.ok && resendData.success) {
				toast.success("A new verification code has been sent to your email.");
				setOtp(new Array(6).fill(""));
				setError("");
				if (inputRefs.current[0]) {
					inputRefs.current[0].focus();
				}
			} else {
				toast.error(resendData.message || "Failed to resend OTP.");
			}
		} catch (error) {
			toast.error("Connection error. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
				{/* Decorative background elements */}
				<div className="absolute top-0 right-0 -mr-48 mt-20 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl opacity-50"></div>
				<div className="absolute bottom-0 left-0 -ml-32 mb-20 w-80 h-80 bg-blue-200/30 rounded-full filter blur-3xl opacity-50"></div>

				<div className="w-full max-w-md relative z-10">
						<div className="text-center mb-6">
								 <WaveLogo className="h-16 w-16 mx-auto" />
						</div>

						<div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-200/50">
								<div className="text-center">
										<h1 className="text-2xl font-bold text-gray-800">Check your email</h1>
										<p className="text-gray-600 mt-2">
												We've sent a six-digit verification code to <br/>
												<span className="font-semibold text-gray-700">{userEmail}</span>
										</p>
								</div>

								{success ? (
									<div className="text-center text-green-600 font-bold text-lg">
										Verification successful! Welcome email sent.<br />Redirecting to login...
									</div>
								) : (
								<form onSubmit={handleSubmit} className="mt-8 space-y-6">
										<div className="flex justify-center gap-2 md:gap-3">
												{otp.map((data, index) => {
														return (
																<input
																		key={index}
																		type="text"
																		maxLength="1"
																		value={data}
																		ref={el => inputRefs.current[index] = el}
																		onChange={e => handleChange(e.target, index)}
																		onKeyDown={e => handleKeyDown(e, index)}
																		onFocus={e => e.target.select()}
																		className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-semibold border rounded-lg transition duration-200
																				${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'}
																		`}
																/>
														);
												})}
										</div>

										{error && <p className="text-center text-red-500 text-sm">{error}</p>}
										<div>
												<button
														type="submit"
														disabled={loading}
														className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-400"
												>
														{loading ? 'Verifying...' : 'Verify Account'}
												</button>
										</div>
								</form>
								)}

								 <div className="mt-6 text-center text-sm">
										<p className="text-gray-600">
												Didn't receive the email?{' '}
												<button onClick={handleResend} className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
														Resend code
												</button>
										</p>
								</div>
						</div>
				</div>
		</div>
	);
}
