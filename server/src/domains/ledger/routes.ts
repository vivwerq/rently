import type { FastifyPluginAsync } from 'fastify';
import { ledgerEngine } from '../../core/ledger.ts';

export const ledgerRoutes: FastifyPluginAsync = async (fastify) => {
  // Real-time double-entry audit reconciliation report
  fastify.get('/audit', async (_request, reply) => {
    const report = ledgerEngine.generateAuditReport();
    return reply.send({
      success: true,
      timestamp: new Date().toISOString(),
      report
    });
  });

  // Chronological journal log
  fastify.get('/journal', async (_request, reply) => {
    const report = ledgerEngine.generateAuditReport();
    return reply.send({
      success: true,
      totalEntries: report.recentEntries.length,
      entries: report.recentEntries
    });
  });

  // Chart of accounts and balances
  fastify.get('/accounts', async (_request, reply) => {
    const report = ledgerEngine.generateAuditReport();
    return reply.send({
      success: true,
      accounts: report.accounts
    });
  });
};
