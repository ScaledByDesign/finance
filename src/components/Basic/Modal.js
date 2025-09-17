export default function Modal({
	showModal,
	setShowModal,
	type,
	title,
	content,
	onOk,
}) {
	return (
		<>
			{showModal && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div
						className="fixed inset-0 h-full w-full bg-black opacity-40"
						onClick={() => setShowModal(false)}
					/>
					<div className="flex min-h-screen items-center px-4 py-8">
						<div className="relative mx-auto w-full max-w-lg rounded-md bg-white p-4 shadow-lg">
							<div className="mt-3 sm:flex">
								{type === "delete" ? (
									<div className="mx-auto flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-100">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6 text-red-600"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								) : (
									<div className="mx-auto flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-100">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6 text-red-600"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								)}
								<div className="mt-2 w-full text-center sm:ml-4 sm:text-left">
									<h4 className="text-lg font-medium text-gray-800">
										{title}
									</h4>
									<p className="mt-2 text-[15px] leading-relaxed text-gray-500">
										{content}
									</p>
									<div className="mt-3 items-center gap-2 sm:flex">
										<button
											className="mt-2 w-full flex-1 rounded-md bg-red-600 p-2.5 text-white outline-none ring-red-600 ring-offset-2 focus:ring-2"
											onClick={onOk}
										>
											Delete
										</button>
										<button
											className="mt-2 w-full flex-1 rounded-md border p-2.5 text-gray-800 outline-none ring-indigo-600 ring-offset-2 focus:ring-2"
											onClick={() => setShowModal(false)}
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
