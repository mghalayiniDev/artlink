export default function Header({ header, desc }) {
    return (
        <div className="flex flex-col gap-0.5 my-9">
            <span className="text-[2.125rem] text-white font-bold">
                {header}
            </span>
            <p className="text-white/60">
                {desc}
            </p>
        </div>
    )
}