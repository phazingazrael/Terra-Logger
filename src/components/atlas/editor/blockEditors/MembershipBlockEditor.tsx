import type { AtlasBlock } from "../../../../definitions/Atlas";

export function MembershipBlockEditor({
	block,
}: Readonly<{
	block: AtlasBlock;
	onChange: (block: AtlasBlock) => void;
}>) {
	console.log("MembershipBlockEditor - block:", block);
	return (
		<p>
			Membership editor placeholder. Keep this block editor isolated for
			religion-specific data.
		</p>
	);
}
