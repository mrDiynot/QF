using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QualiFlow.Infrastructure.Data.Migrations
{
    /// <summary>
    /// Adds HNSW (Hierarchical Navigable Small World) vector indexes on embedding columns
    /// for production-grade vector similarity search performance.
    /// 
    /// Without these indexes, every cosine similarity query performs a full sequential scan.
    /// HNSW indexes provide approximate nearest neighbor (ANN) search with sub-linear time complexity.
    /// 
    /// Requirements:
    ///   - pgvector extension must be installed (CREATE EXTENSION IF NOT EXISTS vector)
    ///   - PostgreSQL 14+ recommended for best HNSW performance
    ///   - Neon.tech and Azure Database for PostgreSQL Flexible Server both support pgvector HNSW
    /// 
    /// Index parameters:
    ///   - m = 16: Maximum number of connections per layer (default, good balance)
    ///   - ef_construction = 64: Size of dynamic candidate list during construction (default)
    ///   - vector_cosine_ops: Optimized for cosine distance queries (matching our search operators)
    /// </summary>
    public partial class AddHnswVectorIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Ensure pgvector extension is available (idempotent)
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS vector;");

            // HNSW index on faq_embeddings.embedding
            // Used by: FaqEmbeddingRepository.SearchSimilarAsync() for FAQ semantic search
            migrationBuilder.Sql(@"
                CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_faq_embeddings_embedding_hnsw 
                ON faq_embeddings 
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
                WHERE embedding IS NOT NULL;
            ");

            // HNSW index on knowledge_base_chunks.embedding
            // Used by: KnowledgeBaseRepository.SearchSimilarChunksAsync() for RAG context retrieval
            migrationBuilder.Sql(@"
                CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_knowledge_base_chunks_embedding_hnsw 
                ON knowledge_base_chunks 
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
                WHERE embedding IS NOT NULL;
            ");

            // HNSW index on conversation_memories.embedding
            // Used by: ConversationMemoryRepository.SearchSimilarAsync() for conversation context
            migrationBuilder.Sql(@"
                CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_conversation_memories_embedding_hnsw 
                ON conversation_memories 
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
                WHERE embedding IS NOT NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_faq_embeddings_embedding_hnsw;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_knowledge_base_chunks_embedding_hnsw;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_conversation_memories_embedding_hnsw;");
        }
    }
}

