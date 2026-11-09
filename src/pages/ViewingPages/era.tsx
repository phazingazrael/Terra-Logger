import { useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useActiveMap } from "../../db/DataContext";
import { saveMapEra } from "../../db/eras";
import type { MapInf } from "../../definitions/TerraLogger";
import type { TLMapEra } from "../../definitions/History";
import type { AtlasPageEditorSavePayload } from "../../definitions/Atlas";
import { getMapEras } from "../../components/HistoryGenerator/eras/mapEras";
import { eraAdapter } from "../../components/atlas/adapters/eraAdapter";
import { isAtlasContent } from "../../components/atlas/core/validators";
import { PageEditor } from "../../components/atlas/editor/PageEditor";
import { AtlasView } from "../../components/atlas/render/AtlasView";
import "./viewStyles.css";

function EraPage({ map, eraId }: { map: MapInf; eraId: string }) {
  const era = useMemo(() => getMapEras(map).find((item) => item.id === eraId), [map, eraId]);
  const [editingEra, setEditingEra] = useState<TLMapEra | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const source = editingEra ?? era;
  const content = useMemo(() => {
    if (!source) return null;
    return isAtlasContent(source.content) ? source.content : eraAdapter.createDefaultContent(source);
  }, [source]);
  const context = useMemo(() => source ? { sourceType: "era" as const, entity: source } : null, [source]);

  async function save(payload: AtlasPageEditorSavePayload<"era">) {
    if (!editingEra || pending.current) return;
    pending.current = true;
    setSaving(true);
    setError(null);
    try {
      if (payload.relatedUpdates?.length) throw new Error("Related-record changes are not supported by the era editor.");
      await saveMapEra(map.mapId, {
        ...payload.entity,
        content: {
          ...payload.content,
          source: { type: "era", entityId: editingEra.id, mapId: map.mapId },
          meta: { ...payload.content.meta, title: payload.entity.name, updatedAt: new Date().toISOString() },
        },
      }, editingEra);
      setEditingEra(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save this era.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  return <Container className="ViewPage Eras" sx={{ "& .atlas-section.header > section > .atlas-section__header": { display: "none" } }}><div className="contentSubBody">
    <div className={`wiki ${editingEra ? "editing" : ""}`}><main className="content">
      <Box className="atlas-page-actions" sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button component={RouterLink} to="/eras" disabled={saving}>All eras</Button>
        {!editingEra && era ? <Button variant="contained" onClick={() => {
          setError(null); setEditingEra(structuredClone(era));
        }}>Edit Era</Button> : null}
        {saving ? <Typography role="status">Saving...</Typography> : null}
      </Box>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {content && context ? editingEra ? <PageEditor content={content} adapter={eraAdapter} context={context}
        onSave={(payload) => { void save(payload); }} onClose={() => {
          if (!pending.current) { setEditingEra(null); setError(null); }
        }} /> : <AtlasView content={content} context={context} />
        : <Alert severity="warning">This era could not be found in the active map.</Alert>}
    </main></div>
  </div></Container>;
}

export default function EraView() {
  const { _id } = useParams<{ _id: string }>();
  const map = useActiveMap<MapInf>();
  if (!map) return <Container><Typography>Select a map or wait for it to finish loading.</Typography></Container>;
  return <EraPage key={`${map.mapId}:${_id}`} map={map} eraId={_id ?? ""} />;
}
