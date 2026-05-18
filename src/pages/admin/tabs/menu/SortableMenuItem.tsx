import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { MenuItem, SubMenuItem } from "@/pages/admin/tabs/MenuNavegacaoTab";

// ── Sortable Sub-Item Row ─────────────────────────────────────────────────────
function SortableSubRow({
  sub,
  menuId,
  primaryColor,
  onToggle,
  onEdit,
  onDelete,
}: {
  sub: SubMenuItem;
  menuId: string;
  primaryColor: string;
  onToggle: (menuId: string, subId: string) => void;
  onEdit: (menuId: string, sub: SubMenuItem) => void;
  onDelete: (menuId: string, subId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sub.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(isDragging ? { "--tw-ring-color": primaryColor } : {}),
  } as CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-gray-100 group ${
        !sub.ativo ? "opacity-50" : ""
      } ${isDragging ? "ring-2 z-10" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <i className="ri-draggable text-sm"></i>
      </button>

      {/* Icon */}
      <div
        className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <i className={`${sub.icon} text-xs`} style={{ color: primaryColor }}></i>
      </div>

      {/* Label + href */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{sub.label}</p>
        <p className="text-[10px] text-gray-400 font-mono truncate">{sub.href}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggle(menuId, sub.id)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer text-xs ${
            sub.ativo ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"
          }`}
          title={sub.ativo ? "Ocultar" : "Mostrar"}
        >
          <i className={sub.ativo ? "ri-eye-off-line" : "ri-eye-line"}></i>
        </button>
        <button
          onClick={() => onEdit(menuId, sub)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer text-xs"
          title="Editar"
        >
          <i className="ri-edit-line"></i>
        </button>
        <button
          onClick={() => onDelete(menuId, sub.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 cursor-pointer text-xs"
          title="Excluir"
        >
          <i className="ri-delete-bin-line"></i>
        </button>
      </div>
      {/* Always-visible status */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: sub.ativo ? "#22c55e" : "#d1d5db" }}
      ></div>
    </div>
  );
}

// ── Sub-items sortable list ───────────────────────────────────────────────────
export function SortableSubList({
  menuId,
  children,
  primaryColor,
  onReorder,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: {
  menuId: string;
  children: SubMenuItem[];
  primaryColor: string;
  onReorder: (menuId: string, newOrder: SubMenuItem[]) => void;
  onToggle: (menuId: string, subId: string) => void;
  onEdit: (menuId: string, sub: SubMenuItem) => void;
  onDelete: (menuId: string, subId: string) => void;
  onAdd: (menuId: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = children.findIndex((s) => s.id === active.id);
    const newIndex = children.findIndex((s) => s.id === over.id);
    onReorder(menuId, arrayMove(children, oldIndex, newIndex));
  };

  return (
    <div className="border-t border-gray-50 bg-gray-50/50">
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <i className="ri-draggable text-gray-300 text-sm"></i>
          Sub-itens <span className="text-gray-300 font-normal normal-case">(arraste para reordenar)</span>
        </span>
        <button
          onClick={() => onAdd(menuId)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          <i className="ri-add-line text-xs"></i> Adicionar
        </button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={children.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="px-4 pb-3 flex flex-col gap-1.5">
            {children.map((sub) => (
              <SortableSubRow
                key={sub.id}
                sub={sub}
                menuId={menuId}
                primaryColor={primaryColor}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {children.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center">
                Nenhum sub-item. Clique em &quot;Adicionar&quot; acima.
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ── Sortable Menu Row (main menu) ─────────────────────────────────────────────
export function SortableMenuRow({
  menu,
  isExpanded,
  primaryColor,
  onToggleExpand,
  onToggleAtivo,
  onEdit,
  onDelete,
  onReorderSubs,
  onToggleSub,
  onEditSub,
  onDeleteSub,
  onAddSub,
}: {
  menu: MenuItem;
  isExpanded: boolean;
  primaryColor: string;
  onToggleExpand: (id: string) => void;
  onToggleAtivo: (id: string) => void;
  onEdit: (menu: MenuItem) => void;
  onDelete: (id: string) => void;
  onReorderSubs: (menuId: string, newOrder: SubMenuItem[]) => void;
  onToggleSub: (menuId: string, subId: string) => void;
  onEditSub: (menuId: string, sub: SubMenuItem) => void;
  onDeleteSub: (menuId: string, subId: string) => void;
  onAddSub: (menuId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        isDragging ? "opacity-60 ring-2 ring-offset-1" : ""
      } ${!menu.ativo ? "border-gray-100 opacity-60" : "border-gray-100"}`}
    >
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
          title="Arrastar para reordenar"
        >
          <i className="ri-draggable text-base"></i>
        </button>

        {/* Icon */}
        <div
          className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: `${primaryColor}12` }}
        >
          <i className="ri-menu-2-line text-sm" style={{ color: primaryColor }}></i>
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{menu.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                menu.ativo ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              {menu.ativo ? "Visível" : "Oculto"}
            </span>
            {menu.children && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium">
                {menu.children.filter((s) => s.ativo).length}/{menu.children.length} sub-itens
              </span>
            )}
          </div>
          {menu.href && <p className="text-xs text-gray-400 font-mono mt-0.5">{menu.href}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleAtivo(menu.id)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer ${
              menu.ativo ? "hover:bg-amber-50 text-amber-500" : "hover:bg-green-50 text-green-500"
            }`}
            title={menu.ativo ? "Ocultar" : "Mostrar"}
          >
            <i className={`${menu.ativo ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
          </button>
          <button
            onClick={() => onEdit(menu)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
            title="Editar"
          >
            <i className="ri-edit-line text-sm"></i>
          </button>
          {menu.children && (
            <button
              onClick={() => onToggleExpand(menu.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              title="Ver sub-itens"
            >
              <i
                className={`ri-arrow-down-s-line text-sm transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              ></i>
            </button>
          )}
          <button
            onClick={() => onDelete(menu.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 cursor-pointer"
            title="Excluir"
          >
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
        </div>
      </div>

      {/* Sub-items list */}
      {isExpanded && menu.children && (
        <SortableSubList
          menuId={menu.id}
          children={menu.children}
          primaryColor={primaryColor}
          onReorder={onReorderSubs}
          onToggle={onToggleSub}
          onEdit={onEditSub}
          onDelete={onDeleteSub}
          onAdd={onAddSub}
        />
      )}
    </div>
  );
}
