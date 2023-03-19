<?php

namespace App\Controller\Admin;

use App\Entity\Article;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\SlugField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class ArticleCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Article::class;
    }


    public function configureFields(string $pageName): iterable
    {
        yield TextField::new('title');
        yield SlugField::new('slug')->setTargetFieldName('title');
        yield ChoiceField::new('author')->allowMultipleChoices(false)->setChoices([
            'Paul'      => 'Paul',
            'Pierre'    => 'Pierre',
            'Ludovic'   => 'Ludovic',
            'Thibaud'   => 'Thibaud',
            'William'   => 'William'
        ]);
        yield TextEditorField::new('content');
        yield DateTimeField::new('dateCreation')->hideOnForm();
        yield DateTimeField::new('dateModification')->hideOnForm();
    }
}
