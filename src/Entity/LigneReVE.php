<?php

namespace App\Entity;

use App\Repository\LigneReVERepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LigneReVERepository::class)]
#[ORM\Table(name: "Ligne_ReVE")]
class LigneReVE
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?int $numero = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $contentBefore = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $contentAfter = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getNumero(): ?int
    {
        return $this->numero;
    }

    public function setNumero(int $numero): self
    {
        $this->numero = $numero;

        return $this;
    }

    public function getContentBefore(): ?string
    {
        return $this->contentBefore;
    }

    public function setContentBefore(?string $contentBefore): self
    {
        $this->contentBefore = $contentBefore;

        return $this;
    }

    public function getContentAfter(): ?string
    {
        return $this->contentAfter;
    }

    public function setContentAfter(?string $contentAfter): self
    {
        $this->contentAfter = $contentAfter;

        return $this;
    }
}
