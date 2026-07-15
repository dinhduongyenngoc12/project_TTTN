const illustrationUrl = "/images/background.png";

export function BackGround() {
    return (
        <div className="hidden flex-1 overflow-hidden bg-green-100 lg:flex">
            <img
                src={illustrationUrl}
                alt="Auth background"
                className="h-full w-full object-cover"
            />
        </div>
    );
}