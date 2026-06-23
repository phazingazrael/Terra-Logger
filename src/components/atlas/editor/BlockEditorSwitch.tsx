import type {
	AtlasBlock,
	AtlasEditorContext,
} from "../../../definitions/Atlas";
import { ChipListBlockEditor } from "./blockEditors/ChipListBlockEditor";
import { CountryCitiesMembershipEditor } from "./blockEditors/CountryCitiesMembershipEditor";
import { DescriptionBlockEditor } from "./blockEditors/DescriptionBlockEditor";
import { DetailsListBlockEditor } from "./blockEditors/DetailsListBlockEditor";
import { DiplomacyBlockEditor } from "./blockEditors/DiplomacyBlockEditor";
import { EntityBlockEditor } from "./blockEditors/EntityBlockEditor";
import { HeadingBlockEditor } from "./blockEditors/HeadingBlockEditor";
import { LinkButtonBlockEditor } from "./blockEditors/LinkButtonBlockEditor";
import { MembershipBlockEditor } from "./blockEditors/MembershipBlockEditor";
import { MilitaryBlockEditor } from "./blockEditors/MilitaryBlockEditor";
import { RichTextBlockEditor } from "./blockEditors/RichTextBlockEditor";
import { SplitListBlockEditor } from "./blockEditors/SplitListBlockEditor";

export function BlockEditorSwitch({
	block,
	context,
	onChange,
}: {
	block: AtlasBlock;
	context: AtlasEditorContext;
	onChange: (block: AtlasBlock) => void;
}) {
	if (isCountryCitiesMembershipBlock(block, context)) {
		return <CountryCitiesMembershipEditor context={context} />;
	}

	if (isDescriptionBlock(block)) {
		return <DescriptionBlockEditor context={context} />;
	}

	if (isCountryDiplomacyBlock(block)) {
		return <DiplomacyBlockEditor context={context} />;
	}

	if (isCountryMilitaryBlock(block)) {
		return <MilitaryBlockEditor context={context} />;
	}

	if (block.type === "splitList" || block.editor.editorType === "splitList") {
		return (
			<SplitListBlockEditor
				block={block}
				context={context}
				onChange={onChange}
			/>
		);
	}

	if (block.dataMode === "entity" || block.dataMode === "computed") {
		return <EntityBlockEditor block={block} context={context} />;
	}

	if (!block.editor.editable) {
		return <EntityBlockEditor block={block} context={context} />;
	}

	switch (block.editor.editorType ?? block.type) {
		case "richText":
			return <RichTextBlockEditor block={block} onChange={onChange} />;

		case "heading":
			return <HeadingBlockEditor block={block} onChange={onChange} />;

		case "detailsList":
			return (
				<DetailsListBlockEditor
					block={block}
					context={context}
					onChange={onChange}
				/>
			);

		case "chipList":
			return <ChipListBlockEditor block={block} onChange={onChange} />;

		case "linkButton":
			return <LinkButtonBlockEditor block={block} onChange={onChange} />;

		case "membership":
			return <MembershipBlockEditor block={block} onChange={onChange} />;

		default:
			return <pre>{JSON.stringify(block.props, null, 2)}</pre>;
	}
}

function isCountryMilitaryBlock(block: AtlasBlock): boolean {
	return (
		block.type === "countryMilitary" ||
		(block.binding as { resolver?: string } | undefined)?.resolver ===
			"country.military"
	);
}

function isCountryDiplomacyBlock(block: AtlasBlock): boolean {
	return (
		block.type === "countryDiplomacy" ||
		(block.binding as { resolver?: string } | undefined)?.resolver ===
			"country.political.diplomacy"
	);
}

function isDescriptionBlock(block: AtlasBlock): boolean {
	return (
		block.type === "description" ||
		block.editor.editorType === "description" ||
		(block.binding as { resolver?: string } | undefined)?.resolver ===
			"generic.description"
	);
}

function isCountryCitiesMembershipBlock(
	block: AtlasBlock,
	context: AtlasEditorContext,
): boolean {
	if (context.sourceType !== "country") return false;

	const label = String(
		block.label ?? block.props?.label ?? block.props?.title ?? "",
	).toLowerCase();

	const entityPath = String(
		block.props?.entityPath ??
			(block.binding as { path?: string } | undefined)?.path ??
			"",
	);

	return (
		block.type === "countryCities" ||
		entityPath === "cities" ||
		label === "cities" ||
		label === "major cities"
	);
}
