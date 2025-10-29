import { useState } from "react";
import { ContentBlock, BlockType } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface PageContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export const PageContentBlockEditor = ({ blocks, onChange }: PageContentBlockEditorProps) => {
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [newBlockType, setNewBlockType] = useState<BlockType>('text');

  const blockTypes: { value: BlockType; label: string }[] = [
    { value: 'text', label: 'Text Content' },
    { value: 'image', label: 'Image' },
    { value: 'hero', label: 'Hero Section' },
    { value: 'features', label: 'Features Grid' },
    { value: 'testimonials', label: 'Testimonials' },
    { value: 'cta', label: 'Call to Action' },
    { value: 'faq', label: 'FAQ' },
    { value: 'card_grid', label: 'Card Grid' },
    { value: 'stats', label: 'Statistics' },
    { value: 'services', label: 'Services' },
  ];

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: newBlockType,
      order: blocks.length,
    } as ContentBlock;

    onChange([...blocks, newBlock]);
    setEditingBlock(newBlock);
    toast.success('Block added');
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
    if (editingBlock?.id === id) setEditingBlock(null);
    toast.success('Block deleted');
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) return;

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    
    // Update order
    newBlocks.forEach((block, i) => block.order = i);
    onChange(newBlocks);
  };

  const updateBlock = (updatedBlock: ContentBlock) => {
    onChange(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    setEditingBlock(updatedBlock);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Block List */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Block</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newBlockType} onValueChange={(v) => setNewBlockType(v as BlockType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {blockTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addBlock} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Block
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blocks ({blocks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blocks yet</p>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer hover:bg-accent ${
                    editingBlock?.id === block.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setEditingBlock(block)}
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                      disabled={index === blocks.length - 1}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {blockTypes.find(t => t.value === block.type)?.label}
                    </p>
                    <p className="text-xs text-muted-foreground">Order: {block.order + 1}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Block Editor */}
      <div className="lg:col-span-2">
        {editingBlock ? (
          <Card>
            <CardHeader>
              <CardTitle>
                Edit {blockTypes.find(t => t.value === editingBlock.type)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BlockEditor block={editingBlock} onUpdate={updateBlock} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                Select a block to edit or add a new one
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Block-specific editor
const BlockEditor = ({ block, onUpdate }: { block: ContentBlock; onUpdate: (block: ContentBlock) => void }) => {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(block, null, 2));

  const handleJsonUpdate = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      onUpdate({ ...block, ...parsed });
      toast.success('Block updated');
    } catch (error) {
      toast.error('Invalid JSON');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Block Data (JSON)</Label>
        <Textarea
          value={jsonValue}
          onChange={(e) => setJsonValue(e.target.value)}
          className="font-mono text-sm h-[400px]"
          placeholder="Edit block JSON..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Edit the JSON directly. See documentation for block schemas.
        </p>
      </div>
      <Button onClick={handleJsonUpdate}>Update Block</Button>
    </div>
  );
};
