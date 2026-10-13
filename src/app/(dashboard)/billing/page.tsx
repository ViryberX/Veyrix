"use client";

import * as React from "react";
import { Check, CreditCard, Download, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoices } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Starter",
      description: "For small teams and experimental deployments.",
      priceMonthly: 49,
      priceAnnual: 39,
      quota: "5M requests/mo",
      features: [
        "Up to 3 projects",
        "5M monthly API calls",
        "Community Discord support",
        "7-day analytics retention",
        "Shared edge nodes",
      ],
      current: false,
    },
    {
      name: "Pro",
      description: "For growing production products requiring higher bandwidth.",
      priceMonthly: 199,
      priceAnnual: 159,
      quota: "20M requests/mo",
      features: [
        "Up to 15 projects",
        "20M monthly API calls",
        "Email & Slack support",
        "30-day analytics retention",
        "Custom domain routing",
        "SOC-2 compliance packet",
      ],
      current: false,
    },
    {
      name: "Scale",
      description: "For enterprise scale workloads with mission-critical SLA.",
      priceMonthly: 499,
      priceAnnual: 399,
      quota: "50M requests/mo",
      features: [
        "Unlimited projects",
        "50M monthly API calls",
        "Dedicated account architect",
        "1-year analytics retention",
        "Dedicated edge clusters",
        "99.99% uptime guarantee SLA",
      ],
      current: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Subscription & Usage Quota
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track resource utilization, manage billing tiers, and download tax invoices.
          </p>
        </div>

        {/* Monthly vs Annual Toggle */}
        <div className="flex items-center rounded-lg bg-secondary/80 p-0.5 border border-border/60">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] text-emerald-500 font-bold">20% off</span>
          </button>
        </div>
      </div>

      {/* Current Quota Meter */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Current Tier: Scale Plan
                </span>
                <Badge variant="success" className="text-[10px] font-mono">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Your monthly billing cycle renews on November 1, 2026.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Billing portal: Stripe customer portal is linked.")}
            >
              <CreditCard className="mr-2 h-3.5 w-3.5" />
              <span>Manage Stripe Billing</span>
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-foreground">
                Monthly Throughput Utilization
              </span>
              <span className="font-mono text-muted-foreground">
                42,800,000 / 50,000,000 requests (85.6%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: "85.6%" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const price =
            billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnual;
          return (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between transition-all ${
                plan.current
                  ? "border-primary shadow-md relative"
                  : "hover:border-border/80"
              }`}
            >
              {plan.current && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="text-[10px] font-mono shadow-xs">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {plan.description}
                </CardDescription>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-foreground">
                    ${price}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="border-t border-border/60 pt-4 space-y-2.5">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Included Capabilities
                  </div>
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-xs text-foreground"
                    >
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Active Plan
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() =>
                        alert(
                          `Checkout flow initialized for ${plan.name} tier (${billingCycle}).`
                        )
                      }
                    >
                      Switch to {plan.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invoices History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoicing & Payment History</CardTitle>
          <CardDescription>
            Download past monthly statement receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Reference</TableHead>
                <TableHead>Billing Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium text-xs">
                    {inv.id}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {inv.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="text-[10px]">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        alert(`Downloading receipt PDF for ${inv.id}...`)
                      }
                    >
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
