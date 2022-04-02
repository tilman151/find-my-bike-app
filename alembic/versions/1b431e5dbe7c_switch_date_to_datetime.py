"""Switch date to datetime

Revision ID: 1b431e5dbe7c
Revises: 9d5436e150d7
Create Date: 2022-04-02 12:00:50.983831

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "1b431e5dbe7c"
down_revision = "9d5436e150d7"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "postings",
        "date",
        existing_type=sa.DATE(),
        type_=sa.DateTime(),
        existing_nullable=True,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "postings",
        "date",
        existing_type=sa.DateTime(),
        type_=sa.DATE(),
        existing_nullable=True,
    )
    # ### end Alembic commands ###
