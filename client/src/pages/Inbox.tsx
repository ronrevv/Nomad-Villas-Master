import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Message } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Inbox() {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const { data: messages, isLoading } = useQuery<Message[]>({
        queryKey: ['/api/messages'],
        queryFn: async () => {
            const res = await fetch(api.messages.list.path);
            if (!res.ok) throw new Error("Failed to fetch messages");
            return res.json();
        },
        enabled: isAuthenticated
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (data: { receiverId: string, content: string }) => {
            const res = await fetch(api.messages.create.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, senderId: user?.id }),
            });
            if (!res.ok) throw new Error("Failed to send message");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
            setReplyContent("");
            toast({ title: "Message sent" });
        }
    });

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <h2 className="text-2xl font-bold font-display">Log in to view messages</h2>
                    <Button onClick={() => window.location.href = "/?login=true"}>Log In</Button>
                </div>
            </Layout>
        );
    }

    const conversations = messages?.reduce((acc, msg) => {
        const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
        if (!acc[otherId]) acc[otherId] = [];
        acc[otherId].push(msg);
        return acc;
    }, {} as Record<string, Message[]>) || {};

    return (
        <Layout>
            <div className="container-padding py-10">
                <h1 className="text-3xl font-display font-bold mb-8">Inbox</h1>

                {isLoading ? (
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                        <Card className="md:col-span-1 overflow-hidden flex flex-col">
                            <CardHeader className="bg-muted/50 py-3">
                                <CardTitle className="text-md">Messages</CardTitle>
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto">
                                {Object.entries(conversations).map(([otherId, msgs]) => (
                                    <div
                                        key={otherId}
                                        className={`p-4 border-b cursor-pointer transition-colors ${activeMessageId === otherId ? 'bg-muted' : 'hover:bg-muted/50'}`}
                                        onClick={() => setActiveMessageId(otherId)}
                                    >
                                        <div className="font-semibold mb-1">Host/Guest {otherId}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                            {msgs[msgs.length - 1].content}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2 text-right">
                                            {format(new Date(msgs[msgs.length - 1].createdAt || new Date()), "MMM d")}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(conversations).length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">No messages yet.</div>
                                )}
                            </div>
                        </Card>

                        <Card className="md:col-span-2 flex flex-col overflow-hidden">
                            {activeMessageId ? (
                                <>
                                    <CardHeader className="bg-muted/50 py-3 border-b">
                                        <CardTitle className="text-md">Conversation</CardTitle>
                                    </CardHeader>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                                        {conversations[activeMessageId]?.sort((a,b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()).map(msg => {
                                            const isMe = msg.senderId === user?.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <div className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                            {format(new Date(msg.createdAt!), "h:mm a")}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="p-4 border-t bg-background">
                                        <form
                                            className="flex gap-2"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if(!replyContent.trim()) return;
                                                sendMessageMutation.mutate({
                                                    receiverId: activeMessageId,
                                                    content: replyContent
                                                });
                                            }}
                                        >
                                            <Input
                                                placeholder="Type a message..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button type="submit" disabled={sendMessageMutation.isPending}>
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
}
