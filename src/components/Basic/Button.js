"use client";

import Link from "next/link";

const Button = ({
	type,
	disabled,
	onClick,
	name,
	href,
	className,
	...rest
}) => {
	return (
		<>
			{href && href !== "" ? (
				<Link
					name={name}
					disabled={disabled || false}
					className={className}
					href={href}
					{...rest}
				>
					{rest.children}
				</Link>
			) : (
				<button
					name={name}
					type={type || "submit"}
					disabled={disabled || false}
					className={className}
					onClick={onClick}
					{...rest}
				>
					{rest.children}
				</button>
			)}
		</>
	);
};

export default Button;
