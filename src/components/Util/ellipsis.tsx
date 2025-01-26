// src/components/Ellipsis.tsx
import type { CSSProperties, FC } from "react";

interface EllipsisProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	style?: CSSProperties;
	className?: string;
}

const Ellipsis: FC<EllipsisProps> = ({
	children,
	style,
	className,
	...props
}) => {
	const defaultStyle: CSSProperties = {
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
		display: "block",
		...style,
	};

	return (
		<div style={defaultStyle} className={className} {...props}>
			{children}
		</div>
	);
};

export default Ellipsis;
