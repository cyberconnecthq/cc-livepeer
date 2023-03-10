import { useContext, useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_GET_MESSAGE, LOGIN_VERIFY } from "../../graphql";
import { DOMAIN } from "../../constants";
import { AuthContext } from "../../context/auth";
import toast from "react-hot-toast";
import PrimaryProfileCard from "../Cards/PrimaryProfileCard";
import { AiOutlinePlusCircle } from "react-icons/ai";
import Link from "next/link";
function SigninBtn() {
	const { setAccessToken, connectWallet, primaryProfile, checkNetwork } =
		useContext(AuthContext);
	const [ccVerified, setCcVerified] = useState(false);
	
	const [loginGetMessage] = useMutation(LOGIN_GET_MESSAGE);
	const [loginVerify] = useMutation(LOGIN_VERIFY);

	const handleLogOut = () => {
		localStorage.clear();
		window.location.reload();
	  };

	const handleOnClick = async () => {
		try {
			/* Connect wallet and get provider */
			const provider = await connectWallet();

			/* Check if the network is the correct one */
			await checkNetwork(provider);

			/* Get the signer from the provider */
			const signer = provider.getSigner();

			/* Get the address from the provider */
			const account = await signer.getAddress();

			/* Get the network from the provider */
			const network = await provider.getNetwork();

			/* Get the chain id from the network */

			/* Get the message from the server */
			const messageResult = await loginGetMessage({
				variables: {
					input: {
						address: account,
						domain: DOMAIN,
					},
				},
			});
			const message = messageResult?.data?.loginGetMessage?.message;

			/* Get the signature for the message signed with the wallet */
			const signature = await signer.signMessage(message);

			/* Verify the signature on the server and get the access token */
			const accessTokenResult = await loginVerify({
				variables: {
					input: {
						address: account,
						domain: DOMAIN,
						signature: signature,
					},
				},
			});
			const accessToken = accessTokenResult?.data?.loginVerify?.accessToken;

			/* Log the access token */
			console.log("~~ Access token ~~");
			console.log(accessToken);

			/* Save the access token in local storage */
			localStorage.setItem("accessToken", accessToken);

			/* Set the access token in the state variable */
			setAccessToken(accessToken);
			setCcVerified(true);

			/* Display success message */
			toast.success("You are now logged in!");
		} catch (error) {
			/* Display error message */
			const message = error.message as string;
			toast.error( message);
		}
	};
	
		return (
			<button className="signin-btn" onClick={handleOnClick}>
				Sign in
			</button>
		);
	
}

export default SigninBtn;
