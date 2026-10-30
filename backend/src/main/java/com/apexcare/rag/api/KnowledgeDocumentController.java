package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.RagDtos;
import com.apexcare.rag.service.CurrentUserService;
import com.apexcare.rag.service.KnowledgeDocumentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/rag-assistant/policies")
public class KnowledgeDocumentController {
    private final KnowledgeDocumentService documents;
    private final CurrentUserService currentUser;

    public KnowledgeDocumentController(KnowledgeDocumentService documents, CurrentUserService currentUser) {
        this.documents = documents;
        this.currentUser = currentUser;
    }

    @GetMapping
    List<RagDtos.DocumentResponse> list() {
        return documents.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    RagDtos.DocumentResponse create(@Valid @RequestBody RagDtos.CreateDocumentRequest request) {
        return documents.createFromText(request, currentUser.requireUser().getId());
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    RagDtos.DocumentResponse upload(
        @RequestPart("file") MultipartFile file,
        @RequestParam String title,
        @RequestParam String category,
        @RequestParam(required = false) String section,
        @RequestParam String version
    ) {
        return documents.createFromFile(file, title, category, section, version, currentUser.requireUser().getId());
    }
}
