from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import List
from dependency_injector.wiring import inject, Provide
from typing import Annotated
from common.auth import CurrentUser, get_current_user
from news.application.news_service import NewsService
from containers import Container
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/news")

class NewsBody(BaseModel):
	name: str = Field(..., max_length=256)
	description: str
	custom_prompt: str = Field(None)
	send_frequency: str = Field(..., pattern="^(daily|weekly|monthly|bi-weekly)$", description="발송 빈도 (daily, weekly, monthly 중 하나)")
	is_active: bool = Field(default=True)
	topic: List[str] = Field(..., description="뉴스레터 토픽 리스트")
	source: List[str] = Field(..., description="뉴스레터 url 리스트")

@router.post("/save", status_code=201)
@inject
async def create_news(
	current_user: Annotated[CurrentUser, Depends(get_current_user)],
	body: NewsBody,
	news_service: NewsService = Depends(Provide[Container.news_service])
):
	await news_service.create_news(
		user_id=current_user.id,
		name=body.name,
		description=body.description,
		custom_prompt=body.custom_prompt,
		send_frequency=body.send_frequency,
		is_active=body.is_active,
		topic=body.topic if body.topic else [],
		source=body.source if body.source else [],
	)
	response = JSONResponse(content={"message": "뉴스레터가 성공적으로 생성되었습니다."}, status_code=201)
	return response
