export default function Header({ header, desc }) {
    return (
        <div className="flex flex-col gap-0.5 my-9">
            <span className="text-[2.125rem] text-gray-900 font-bold">
                {header}
            </span>
            <p className="text-gray-500">
                {desc}
            </p>
        </div>
    )
}