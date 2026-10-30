package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.RagDtos;
import com.apexcare.rag.service.CurrentUserService;
import com.apexcare.rag.service.RagAssistantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rag-assistant")
public class RagAssistantController {
    private final RagAssistantService assistant;
    private final CurrentUserService currentUser;

    public RagAssistantController(RagAssistantService assistant, CurrentUserService currentUser) {
        this.assistant = assistant;
        this.currentUser = currentUser;
    }

    @PostMapping("/query")
    RagDtos.RagAnswerResponse query(@Valid @RequestBody RagDtos.RagQueryRequest request) {
        return assistant.answer(request, currentUser.requireUser());
    }
}
