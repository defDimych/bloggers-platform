import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentLikeEntity1759425835456 implements MigrationInterface {
  name = 'AddCommentLikeEntity1759425835456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."CommentsLikes_status_enum" AS ENUM('None', 'Like', 'Dislike')`,
    );
    await queryRunner.query(
      `CREATE TABLE "CommentsLikes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "commentId" integer NOT NULL, "userId" integer NOT NULL, "status" "public"."CommentsLikes_status_enum" NOT NULL, CONSTRAINT "REL_41dc91cf58a79ec5f19c5c15e3" UNIQUE ("userId"), CONSTRAINT "PK_6211beadd299640d355c8c38b1c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "CommentsLikes" ADD CONSTRAINT "FK_36fc3a8f68647422d871afa262d" FOREIGN KEY ("commentId") REFERENCES "Comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "CommentsLikes" ADD CONSTRAINT "FK_41dc91cf58a79ec5f19c5c15e32" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CommentsLikes" DROP CONSTRAINT "FK_41dc91cf58a79ec5f19c5c15e32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "CommentsLikes" DROP CONSTRAINT "FK_36fc3a8f68647422d871afa262d"`,
    );
    await queryRunner.query(`DROP TABLE "CommentsLikes"`);
    await queryRunner.query(`DROP TYPE "public"."CommentsLikes_status_enum"`);
  }
}
