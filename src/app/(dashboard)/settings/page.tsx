"use client";

import * as React from "react";
import {
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Shield,
  Bell,
  Building,
  Save,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initialApiKeys } from "@/lib/mock-data";
import { ApiKey } from "@/types/saas";
import { useAuth } from "@/components/providers/auth-provider";

export default function SettingsPage() {
  const { requireAuth } = useAuth();
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>(initialApiKeys);
  const [newKeyDialogOpen, setNewKeyDialogOpen] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [generatedSecret, setGeneratedSecret] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState(false);

  // Workspace form state
  const [workspaceName, setWorkspaceName] = React.useState("Veyrix Core (Production)");
  const [workspaceSlug, setWorkspaceSlug] = React.useState("veyrix-prod");
  const [isSaved, setIsSaved] = React.useState(false);

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const secret = `vx_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: `${secret.substring(0, 12)}...`,
      createdDate: "Just now",
      lastUsed: "Never",
      status: "Active",
    };

    setApiKeys([newKey, ...apiKeys]);
    setGeneratedSecret(secret);
  };

  const handleRevokeKey = (id: string) => {
    requireAuth(() => {
      if (confirm("Revoke this API Key immediately? All requests using it will fail.")) {
        setApiKeys((prev) =>
          prev.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k))
        );
      }
    }, "To revoke API keys, please sign in.");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }, "To save workspace settings, please sign in.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Workspace Settings & Configuration
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage identity parameters, production API secrets, and workspace security protocols.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General & Appearance</TabsTrigger>
          <TabsTrigger value="apikeys">API Keys & Tokens</TabsTrigger>
          <TabsTrigger value="security">Security & Sessions</TabsTrigger>
          <TabsTrigger value="notifications">Alert Preferences</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="apikeys" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Production API Keys</CardTitle>
                <CardDescription>
                  Secrets used by backend microservices and SDK clients to authenticate with Veyrix
                </CardDescription>
              </div>

              <Button
                onClick={() => {
                  requireAuth(() => {
                    setNewKeyName("");
                    setGeneratedSecret(null);
                    setNewKeyDialogOpen(true);
                  }, "To create API secret keys, please sign in.");
                }}
                size="sm"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                <span>Create Secret Key</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Name</TableHead>
                    <TableHead>Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {k.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {k.keyPrefix}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={k.status === "Active" ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {k.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {k.createdDate}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {k.lastUsed}
                      </TableCell>
                      <TableCell className="text-right">
                        {k.status === "Active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(k.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <form onSubmit={handleSaveGeneral}>
              <CardHeader>
                <CardTitle>Workspace Profile</CardTitle>
                <CardDescription>
                  Update the primary metadata for this organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Workspace Name
                  </label>
                  <Input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Workspace Slug
                  </label>
                  <div className="flex rounded-md border border-input bg-background/50">
                    <span className="flex items-center px-3 text-xs text-muted-foreground border-r border-border">
                      veyrix.io/
                    </span>
                    <input
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      className="w-full bg-transparent px-3 py-1 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button type="submit" size="sm">
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </Button>
                  {isSaved && (
                    <span className="text-xs text-emerald-500 font-medium">
                      Changes saved successfully.
                    </span>
                  )}
                </div>
              </CardContent>
            </form>
          </Card>

          {/* Appearance & Theme Setting */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Interface Appearance</CardTitle>
              <CardDescription>
                Choose how Veyrix looks to you. Select a light or dark theme, or sync with your operating system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "light",
                    title: "Light",
                    description: "Clean porcelain surfaces with high-contrast text",
                    icon: Sun,
                    iconColor: "text-amber-500",
                  },
                  {
                    id: "dark",
                    title: "Dark",
                    description: "Deep obsidian surfaces designed for low-light focus",
                    icon: Moon,
                    iconColor: "text-indigo-400",
                  },
                  {
                    id: "system",
                    title: "System",
                    description: "Automatically match your device's display schedule",
                    icon: Monitor,
                    iconColor: "text-muted-foreground",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mounted && theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                          : "border-border hover:bg-secondary/60 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Icon className={`h-4 w-4 ${item.iconColor}`} />
                        {isSelected && (
                          <Badge variant="default" className="text-[10px] py-0 font-mono">
                            Active
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Session Security</CardTitle>
              <CardDescription>
                Configure multi-factor authentication and session policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    Two-Factor Authentication (2FA)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Enforce authenticator app (TOTP) verification for all workspace members.
                  </p>
                </div>
                <Badge variant="success">Enforced</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    Single Sign-On (SAML / Okta)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Integrate your enterprise identity provider.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("SAML SSO is available on Scale enterprise tier.")}
                >
                  Configure SSO
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Operational Alert Channels</CardTitle>
              <CardDescription>
                Choose which events trigger instant email and webhook notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Quota Threshold Warning (80% / 95%)", checked: true },
                { title: "Production Deployment Failures", checked: true },
                { title: "Anomalous Latency Spike (> 120ms)", checked: true },
                { title: "New Team Member Invitation Accepted", checked: false },
                { title: "Monthly Statement & Invoice Ready", checked: true },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    defaultChecked={item.checked}
                    className="rounded border-border"
                  />
                  <span className="font-medium text-foreground">{item.title}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate API Key Dialog */}
      <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {!generatedSecret ? (
            <form onSubmit={handleGenerateKey}>
              <DialogHeader>
                <DialogTitle>Generate New API Secret</DialogTitle>
                <DialogDescription>
                  Enter a label describing where this secret key will be used.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Key Description
                  </label>
                  <Input
                    placeholder="e.g. Ingestion Pipeline Lambda"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewKeyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Generate Secret</Button>
              </DialogFooter>
            </form>
          ) : (
            <div>
              <DialogHeader>
                <DialogTitle>Save Your API Key</DialogTitle>
                <DialogDescription className="text-amber-500 font-medium">
                  Please copy your secret key now. You will not be able to view it again.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-2.5">
                  <code className="text-xs font-mono text-foreground break-all flex-1">
                    {generatedSecret}
                  </code>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(generatedSecret)}
                  >
                    {copiedKey ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setGeneratedSecret(null);
                    setNewKeyDialogOpen(false);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
