export default function HomePage() {
    return (
        <div className="flex min-h-screen justify-center bg-gray-100 px-4 py-6 text-gray-900 sm:px-6 sm:py-10">
            <div className="m-0 flex w-full max-w-screen-xl flex-1 justify-center overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="w-full p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
                    <div className="mt-12 flex flex-col items-center">
                        <div className="mt-8 w-full flex-1">
                            <div className="flex flex-col items-center">
                                <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
                                <p className="mt-4 text-center text-gray-600">
                                    This is the main page of the application. You can navigate to different sections from here.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}