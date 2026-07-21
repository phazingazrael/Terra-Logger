import type { AtlasBlock } from "../../../../definitions/Atlas";

export function MembershipBlockEditor(
	_props: Readonly<{
		block: AtlasBlock;
		onChange: (block: AtlasBlock) => void;
	}>,
) {
	return (
		<p>
			Membership editor placeholder. Keep this block editor isolated for
			religion-specific data.
		</p>
	);
}
