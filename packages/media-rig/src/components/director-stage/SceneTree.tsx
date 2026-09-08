import { useState } from "react";
import { ChevronDown, ChevronRight, Camera, UserRound, Box, Copy, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { selectionKey } from "./DirectorStage.utils";
import type { SceneItem } from "./DirectorStage.sceneTypes";
import type { DirectorComposition, DirectorSelection } from "./DirectorStage.types";

export default function SceneTree({
  composition,
  query = "",
  selection,
  onSelect,
  onDuplicate,
  onRemove,
  onRename,
  activeCameraId,
  onToggleVisible,
}: {
  composition: DirectorComposition;
  query?: string;
  selection: DirectorSelection;
  onSelect: (selection: DirectorSelection) => void;
  onDuplicate: (selection: Exclude<DirectorSelection, null>) => void;
  onRemove: (selection: Exclude<DirectorSelection, null>) => void;
  activeCameraId: string | null;
  onRename: (selection: Exclude<DirectorSelection, null>, label: string) => void;
  onToggleVisible: (selection: Exclude<DirectorSelection, null>, visible: boolean) => void;
}) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groups: Array<{ title: string; items: SceneItem[] }> = [
    { title: "角色", items: composition.characters.map((item) => ({ kind: "character", item })) },
    { title: "摄像机", items: composition.cameras.map((item) => ({ kind: "camera", item })) },
    { title: "道具", items: composition.props.map((item) => ({ kind: "prop", item })) },
  ];

  return (
    <div className="director-stage__tree">
      {groups.map((group) => {
        const items = group.items.filter(({ item }) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
        const open = Boolean(query) || !collapsed[group.title];
        return <div key={group.title}>
          <button type="button" className="director-stage__tree-title" aria-expanded={open} onClick={() => setCollapsed((previous) => ({ ...previous, [group.title]: open }))}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {group.title === "角色" ? <UserRound size={14} /> : group.title === "摄像机" ? <Camera size={14} /> : <Box size={14} />}
            <span>{group.title}</span><span>{items.length}</span>
          </button>
          {open && <div className="director-stage__tree-branch">
          {items.length === 0 && <p className="director-stage__empty">{query ? "没有匹配的对象" : "暂无对象"}</p>}
          {items.map(({ kind, item }) => {
            const selected = selectionKey(selection) === `${kind}:${item.id}`;
            const itemSelection = { kind, id: item.id } as Exclude<DirectorSelection, null>;
            return (
              <div
                key={item.id}
                className={selected ? "director-stage__tree-item is-active" : "director-stage__tree-item"}
              >
                {renaming === item.id ? <input autoFocus aria-label={`重命名 ${item.label}`} value={draftName} onFocus={(event) => event.target.select()} onChange={(event) => setDraftName(event.target.value)} onBlur={() => { if (draftName.trim()) onRename(itemSelection, draftName.trim()); setRenaming(null); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") { event.stopPropagation(); setRenaming(null); } }} /> : <button type="button" className="director-stage__tree-select" onClick={() => onSelect(itemSelection)} style={{ opacity: item.visible ? 1 : 0.4 }}>
                  {kind === "camera" ? <Camera size={14} /> : kind === "character" ? <UserRound size={14} /> : <Box size={14} />}
                  <span>{item.label}</span>{kind === "camera" && activeCameraId === item.id && <i className="director-stage__active-camera" aria-label="当前机位" />}
                </button>}
                <div className="director-stage__tree-actions">
                  <button
                    type="button"
                    title="复制"
                    aria-label={`复制 ${item.label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDuplicate(itemSelection);
                    }}
                  >
                    <Copy size={14} />
                  </button>
                  <button type="button" title="重命名" aria-label={`重命名 ${item.label}`} onClick={() => { setDraftName(item.label); setRenaming(item.id); }}><Pencil size={14} /></button>
                  <button
                    type="button"
                    title={item.visible ? "隐藏" : "显示"}
                    aria-label={`${item.visible ? "隐藏" : "显示"} ${item.label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleVisible(itemSelection, !item.visible);
                    }}
                  >
                    {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    type="button"
                    disabled={kind === "camera" && composition.cameras.length <= 1}
                    title={kind === "camera" && composition.cameras.length <= 1 ? "至少保留一个机位" : "删除"}
                    aria-label={`删除 ${item.label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(itemSelection);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          </div>}
        </div>;
      })}
    </div>
  );
}
