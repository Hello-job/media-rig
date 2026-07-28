export class HistoryManager<T> {
  private readonly limit: number;
  private entries: T[] = [];
  private cursor = -1;

  constructor(limit: number) {
    this.limit = Math.max(1, Math.floor(limit));
  }

  get current(): T | null {
    return this.cursor < 0 ? null : structuredClone(this.entries[this.cursor]);
  }

  get canUndo() {
    return this.cursor > 0;
  }

  get canRedo() {
    return this.cursor >= 0 && this.cursor < this.entries.length - 1;
  }

  reset(value: T) {
    this.entries = [structuredClone(value)];
    this.cursor = 0;
  }

  commit(value: T) {
    const next = structuredClone(value);
    const current = this.entries[this.cursor];
    if (current !== undefined && JSON.stringify(current) === JSON.stringify(next)) return false;
    this.entries = this.entries.slice(0, this.cursor + 1);
    this.entries.push(next);
    if (this.entries.length > this.limit) {
      this.entries.splice(0, this.entries.length - this.limit);
    }
    this.cursor = this.entries.length - 1;
    return true;
  }

  undo(): T | null {
    if (!this.canUndo) return null;
    this.cursor -= 1;
    return structuredClone(this.entries[this.cursor]);
  }

  redo(): T | null {
    if (!this.canRedo) return null;
    this.cursor += 1;
    return structuredClone(this.entries[this.cursor]);
  }
}
