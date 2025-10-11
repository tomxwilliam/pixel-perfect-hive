import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search, Edit, Trash2, Star, Sparkles, GripVertical } from 'lucide-react';
import { useGames, useDeleteGame, Game } from '@/hooks/useGames';
import { CreateEditGameDialog } from './forms/CreateEditGameDialog';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminGames = () => {
  const { data: games = [], isLoading, refetch } = useGames();
  const deleteGame = useDeleteGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const isMobile = useIsMobile();

  const handleCreateNew = () => {
    setSelectedGame(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setIsDialogOpen(true);
  };

  const handleDelete = (game: Game) => {
    setGameToDelete(game);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!gameToDelete) return;
    await deleteGame.mutateAsync(gameToDelete.id);
    setDeleteDialogOpen(false);
    setGameToDelete(null);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(games);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all affected items
    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index,
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('games')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      toast.success('Game order updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update game order');
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      in_concept: { label: 'In Concept', variant: 'outline' },
      early_development: { label: 'Early Dev', variant: 'secondary' },
      active_development: { label: 'Active Dev', variant: 'default' },
      launched: { label: 'Launched', variant: 'default' },
    };
    const config = variants[status] || variants.in_concept;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Management</CardTitle>
          <CardDescription>Loading games...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Management</CardTitle>
          <CardDescription>Manage your game portfolio</CardDescription>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button onClick={handleCreateNew}>Add New Game</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredGames.map((game) => (
            <Card key={game.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {game.logo_url && (
                    <img src={game.logo_url} alt={game.name} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {game.name}
                      {game.is_featured && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                      {game.is_new && <Sparkles className="h-3 w-3 text-blue-500" />}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {game.description}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(game.status)}
                  {game.ios_link && <Badge variant="outline">iOS</Badge>}
                  {game.google_play_link && <Badge variant="outline">Android</Badge>}
                </div>

                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(game)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(game)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Desktop table layout with drag-and-drop
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Management</CardTitle>
        <CardDescription>Manage your game portfolio and display order</CardDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Button onClick={handleCreateNew}>Add New Game</Button>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="games">
            {(provided) => (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredGames.map((game, index) => (
                    <Draggable key={game.id} draggableId={game.id} index={index}>
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <TableCell {...provided.dragHandleProps}>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {game.logo_url && (
                                <img src={game.logo_url} alt={game.name} className="w-10 h-10 rounded object-cover" />
                              )}
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {game.name}
                                  {game.is_featured && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                                  {game.is_new && <Sparkles className="h-3 w-3 text-blue-500" />}
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {game.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(game.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {game.ios_link && <Badge variant="outline">iOS</Badge>}
                              {game.google_play_link && <Badge variant="outline">Android</Badge>}
                              {!game.ios_link && !game.google_play_link && (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(game)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(game)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>

      <CreateEditGameDialog
        game={selectedGame}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false);
          refetch();
        }}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Game"
        description={`Are you sure you want to delete ${gameToDelete?.name}?`}
        warningText="This will also delete all associated images. This action cannot be undone."
      />
    </Card>
  );
};
