import { Copy, Eye, EyeOff, Lock, Trash2, Unlock } from "lucide-react";
import { selectionKey } from "./DirectorStage.utils";
import type { SceneItem } from "./DirectorStage.sceneTypes";
import type { DirectorComposition, DirectorSelection } from "./DirectorStage.types";

export default function SceneTree({
  composition,
  selection,
  onSelect,
  onDuplicate,
  onRemove,
  onToggleLocked,
  onToggleVisible,
}: {
  composition: DirectorComposition;
  selection: DirectorSelection;
  onSelect: (selection: DirectorSelection) => void;
  onDuplicate: (selection: Exclude<DirectorSelection, null>) => void;
  onRemove: (selection: Exclude<DirectorSelection, null>) => void;
  onToggleLocked: (selection: Exclude<DirectorSelection, null>, locked: boolean) => void;
  onToggleVisible: (selection: Exclude<DirectorSelection, null>, visible: boolean) => void;
}) {
  const groups: Array<{ title: string; items: SceneItem[] }> = [
    { title: "相机", items: composition.cameras.map((item) => ({ kind: "camera", item })) },
    { title: "角色", items: composition.characters.map((item) => ({ kind: "character", item })) },
    { title: "道具", items: composition.props.map((item) => ({ kind: "prop", item })) },
  ];

  return (
    <div className="director-stage__tree">
      {groups.map((group) => (
        <div key={group.title}>
          <div className="director-stage__tree-title">
            <span>⌄ {group.title}</span>
            <span>{group.items.length}</span>
          </div>
          {group.items.map(({ kind, item }) => {
            const selected = selectionKey(selection) === `${kind}:${item.id}`;
            const itemSelection = { kind, id: item.id } as Exclude<DirectorSelection, null>;
            return (
              <div
                key={item.id}
                className={selected ? "director-stage__tree-item is-active" : "director-stage__tree-item"}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(itemSelection)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(itemSelection);
                  }
                }}
              >
                <span className={`director-stage__tree-icon is-${kind}`}>
                  {kind === "camera" ? "▣" : kind === "character" ? "♙" : "▦"}
                </span>
                <span>{item.label}</span>
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
                    title={item.locked ? "解锁" : "锁定"}
                    aria-label={`${item.locked ? "解锁" : "锁定"} ${item.label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleLocked(itemSelection, !item.locked);
                    }}
                  >
                    {item.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <button
                    type="button"
                    title="删除"
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
        </div>
      ))}
    </div>
  );
}
